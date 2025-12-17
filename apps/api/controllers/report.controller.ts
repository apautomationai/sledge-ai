import { Request, Response } from "express";
import axios from "axios";

interface BugReportInput {
  category: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  source?: string;
}

const {
  JIRA_BASE_URL,
  JIRA_EMAIL,
  JIRA_API_TOKEN,
  JIRA_PROJECT_KEY,
} = process.env;

// 🚨 FAIL FAST – prevents silent OAuth fallback
if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
  throw new Error("❌ Jira API Token env variables missing");
}

// Priority mapping
const mapPriority = (priority: string) => {
  switch (priority) {
    case "critical":
      return "Highest";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    default:
      return "Low";
  }
};

// Convert text → ADF
const toADF = (text: string) => ({
  type: "doc",
  version: 1,
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text }],
    },
  ],
});

const JIRA_AUTH_HEADER =
  "Basic " +
  Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

// Dedicated axios instance (prevents overrides)
const jiraClient = axios.create({
  baseURL: JIRA_BASE_URL,
  timeout: 10000,
  headers: {
    Authorization: JIRA_AUTH_HEADER,
    "Content-Type": "application/json",
  },
});

export const createBugReport = async (req: Request, res: Response) => {
  try {
    const { category, title, description, priority, source }: BugReportInput =
      req.body;

    if (!category || !title || !description || !priority) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const fullDescription = `
Category: ${category}
Priority: ${priority}
Source: ${source || "sledge_in_app_reporter"}

Description:
${description}
    `.trim();

    const jiraPayload = {
      fields: {
        project: { key: JIRA_PROJECT_KEY },
        summary: `${category}: ${title}`,
        description: toADF(fullDescription),
        issuetype: { name: "Task" }, // or "Bug"
        priority: { name: mapPriority(priority) },
        labels: ["sledge-bug"],
      },
    };

    const response = await jiraClient.post("/rest/api/3/issue", jiraPayload);

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

    return res.status(500).json({
      message: "Failed to create Jira issue",
      error: err.response?.data || err.message,
    });
  }
};
