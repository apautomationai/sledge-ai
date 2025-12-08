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

// Map your priority to Jira priority names
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

// Convert text → ADF format
const toADF = (text: string) => ({
  type: "doc",
  version: 1,
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text,
        },
      ],
    },
  ],
});

export const createBugReport = async (req: Request, res: Response) => {
  try {
    const { category, title, description, priority, source }: BugReportInput =
      req.body;

    if (!category || !title || !description || !priority) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Full human-readable description
    const fullDescription = `
Category: ${category}
Priority: ${priority}
Source: ${source || "sledge_in_app_reporter"}

Description:
${description}
    `.trim();

    // Jira payload with valid ADF description
    const jiraPayload = {
      fields: {
        project: { key: JIRA_PROJECT_KEY },
        summary: `${category}: ${title}`,
        description: toADF(fullDescription),
        issuetype: { name: "Task" }, // change to "Bug" if needed
        priority: { name: mapPriority(priority) },
        labels: ["sledge-bug"],
      },
    };

    const response = await axios.post(
      `${JIRA_BASE_URL}/rest/api/3/issue`,
      jiraPayload,
      {
        auth: {
          username: JIRA_EMAIL!,
          password: JIRA_API_TOKEN!,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Jira issue created:", response.data);

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
      stack: err.stack,
    });

    return res.status(500).json({
      message: "Failed to create Jira issue",
      error: err.response?.data || err.message,
    });
  }
};
