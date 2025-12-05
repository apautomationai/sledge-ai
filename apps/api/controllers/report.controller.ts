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
  JIRA_PROJECT_KEY
} = process.env;

const textToADF = (text: string) => ({
  type: "doc",
  version: 1,
  content: text.split("\n").map((line) => ({
    type: "paragraph",
    content: [
      {
        type: "text",
        text: line
      }
    ]
  }))
});

export const createBugReport = async (req: Request, res: Response) => {
  try {
    const { category, title, description, priority, source }: BugReportInput =
      req.body;

    if (!category || !title || !description || !priority) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const fullDescription = `
Category: ${category}
Priority: ${priority}
Source: ${source || "sledge_in_app_reporter"}

Description:
${description}
    `;

    const jiraPayload = {
      fields: {
        project: { key: JIRA_PROJECT_KEY },
        summary: `${category}: ${title}`,
        description: textToADF(fullDescription),
        issuetype: { name: "Bug" },
        priority: {
          name:
            priority === "critical"
              ? "Highest"
              : priority === "high"
              ? "High"
              : priority === "medium"
              ? "Medium"
              : "Low"
        }
      }
    };

    const response = await axios.post(
      `${JIRA_BASE_URL}/rest/api/3/issue`,
      jiraPayload,
      {
        auth: {
          username: JIRA_EMAIL!,
          password: JIRA_API_TOKEN!
        },
        headers: { "Content-Type": "application/json" }
      }
    );

    return res.json({
      success: true,
      issueKey: response.data.key,
      message: "Jira issue created successfully"
    });
  } catch (err: any) {
    console.error("Jira error:", err.response?.data || err);
    return res.status(500).json({
      message: "Failed to create Jira issue",
      error: err.response?.data || err.message
    });
  }
};
