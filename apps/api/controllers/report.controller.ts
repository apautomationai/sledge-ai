import { Request, Response, RequestHandler } from "express";
import axios, { AxiosError } from "axios";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware"; // your updated middleware

interface BugReportInput {
  category: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  source?: string;
}

// Priority mapping
const mapPriority = (priority: string) => ({
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Highest",
}[priority] || "Medium");

// Convert text to minimal Jira ADF
const toADF = (text: string) => ({
  version: 1,
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

export const createBugReport: RequestHandler = async (req: Request, res: Response) => {
  const r = req as AuthenticatedRequest;
  try {
    const user = r.user;

    if (!user || !user.email) {
      return res.status(401).json({ message: "Unauthorized: please sign in" });
    }

    const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } = process.env;
    if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
      console.error("Missing Jira env vars");
      return res.status(500).json({ message: "Jira is not configured on the server" });
    }

    const { category, title, description, priority, source }: BugReportInput = r.body;
    if (!category || !title || !description || !priority) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const fullDescription = `
Reported By:
Name: ${user.firstName ?? ""} ${user.lastName ?? ""}
Email: ${user.email}

Category: ${category}
Priority: ${priority}
Source: ${source || "sledge_in_app_reporter"}

Description:
${description}
    `.trim();

    const jiraClient = axios.create({
      baseURL: JIRA_BASE_URL,
      auth: { username: JIRA_EMAIL, password: JIRA_API_TOKEN },
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      timeout: 60000, // 60s timeout
    });

    const jiraPayload = {
      fields: {
        project: { key: JIRA_PROJECT_KEY },
        summary: `${category}: ${title}`,
        description: toADF(fullDescription),
        issuetype: { name: "Task" },
        priority: { name: mapPriority(priority) },
        labels: ["sledge-bug"],
      },
    };

    // Retry logic for timeout
    let response;
    try {
      response = await jiraClient.post("/rest/api/3/issue", jiraPayload);
    } catch (err: any) {
      if ((err as AxiosError).code === "ECONNABORTED") {
        console.warn("Jira request timed out, retrying once...");
        response = await jiraClient.post("/rest/api/3/issue", jiraPayload);
      } else {
        throw err;
      }
    }

    return res.status(201).json({
      success: true,
      issueKey: response.data.key,
      message: "Jira issue created successfully",
    });

  } catch (err: any) {
    console.error("Jira error:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });

    const errorMessage =
      err.code === "ECONNABORTED"
        ? "Jira request timed out. Please try again later."
        : err.response?.data?.errorMessages?.[0] || err.message || "Failed to create Jira issue";

    return res.status(500).json({
      message: "Failed to create Jira issue",
      error: errorMessage,
    });
  }
};
