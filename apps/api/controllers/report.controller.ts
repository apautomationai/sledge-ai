import { Request, Response } from "express";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";

const debugInfoSchema = z.object({
  logs: z.array(
    z.object({
      timestamp: z.string(),
      level: z.enum(["log", "warn", "error", "info"]),
      message: z.string(),
    }),
  ),
  networkErrors: z.array(
    z.object({
      timestamp: z.string(),
      method: z.string(),
      url: z.string(),
      status: z.number().nullable(),
      statusText: z.string(),
      error: z.string(),
    }),
  ),
  browserContext: z.object({
    url: z.string(),
    userAgent: z.string(),
    platform: z.string(),
    language: z.string(),
    screenSize: z.string(),
    viewportSize: z.string(),
    timestamp: z.string(),
  }),
});

const bugReportSchema = z.object({
  category: z.string().min(1, "Category is required"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be less than 5000 characters"),
  priority: z.enum(["low", "medium", "high", "critical"], {
    errorMap: () => ({ message: "Invalid priority level" }),
  }),
  source: z.string().optional(),
  debugInfo: z.string().optional(),
});

type BugReportInput = z.infer<typeof bugReportSchema>;
type DebugInfo = z.infer<typeof debugInfoSchema>;

const mapPriority = (priority: string) =>
  ({
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Highest",
  })[priority] || "Medium";

const buildADFDescription = (
  user: { firstName?: string; lastName?: string; email: string },
  data: BugReportInput,
  debugInfo?: DebugInfo,
) => {
  const content: any[] = [];

  content.push({
    type: "heading",
    attrs: { level: 3 },
    content: [{ type: "text", text: "Reporter Information" }],
  });
  content.push({
    type: "paragraph",
    content: [
      {
        type: "text",
        text:
          `Name: ${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
          "N/A",
      },
    ],
  });
  content.push({
    type: "paragraph",
    content: [{ type: "text", text: `Email: ${user.email}` }],
  });

  content.push({
    type: "heading",
    attrs: { level: 3 },
    content: [{ type: "text", text: "Bug Details" }],
  });
  content.push({
    type: "paragraph",
    content: [
      { type: "text", text: "Category: ", marks: [{ type: "strong" }] },
      { type: "text", text: data.category },
    ],
  });
  content.push({
    type: "paragraph",
    content: [
      { type: "text", text: "Priority: ", marks: [{ type: "strong" }] },
      { type: "text", text: data.priority },
    ],
  });
  content.push({
    type: "paragraph",
    content: [
      { type: "text", text: "Source: ", marks: [{ type: "strong" }] },
      { type: "text", text: data.source || "sledge_in_app_reporter" },
    ],
  });

  content.push({
    type: "heading",
    attrs: { level: 3 },
    content: [{ type: "text", text: "Description" }],
  });
  content.push({
    type: "paragraph",
    content: [{ type: "text", text: data.description }],
  });

  if (debugInfo) {
    content.push({ type: "rule" });

    content.push({
      type: "expand",
      attrs: { title: "Browser Context" },
      content: [
        {
          type: "codeBlock",
          attrs: { language: "json" },
          content: [
            {
              type: "text",
              text: JSON.stringify(debugInfo.browserContext, null, 2),
            },
          ],
        },
      ],
    });

    if (debugInfo.logs.length > 0) {
      const logsText = debugInfo.logs
        .map(
          (log) =>
            `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`,
        )
        .join("\n");

      content.push({
        type: "expand",
        attrs: { title: `Console Logs (${debugInfo.logs.length} entries)` },
        content: [
          {
            type: "codeBlock",
            attrs: { language: "text" },
            content: [{ type: "text", text: logsText }],
          },
        ],
      });
    }

    if (debugInfo.networkErrors.length > 0) {
      const networkText = debugInfo.networkErrors
        .map(
          (err) =>
            `[${err.timestamp}] ${err.method} ${err.url} → ${err.status || "NO_RESPONSE"} ${err.statusText}\n  Error: ${err.error}`,
        )
        .join("\n\n");

      content.push({
        type: "expand",
        attrs: {
          title: `Network Errors (${debugInfo.networkErrors.length} errors)`,
        },
        content: [
          {
            type: "codeBlock",
            attrs: { language: "text" },
            content: [{ type: "text", text: networkText }],
          },
        ],
      });
    }
  }

  return {
    version: 1,
    type: "doc",
    content,
  };
};

class ReportController {
  createBugReport = async (req: Request, res: Response) => {
    const r = req as AuthenticatedRequest;
    try {
      const user = r.user;

      if (!user || !user.email) {
        return res
          .status(401)
          .json({ message: "Unauthorized: please sign in" });
      }

      const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY } =
        process.env;
      if (
        !JIRA_BASE_URL ||
        !JIRA_EMAIL ||
        !JIRA_API_TOKEN ||
        !JIRA_PROJECT_KEY
      ) {
        console.error("Missing Jira env vars");
        return res
          .status(500)
          .json({ message: "Jira is not configured on the server" });
      }

      console.log("Raw request body:", r.body);
      console.log("Raw debugInfo field:", r.body?.debugInfo);

      const parseResult = bugReportSchema.safeParse(r.body);
      if (!parseResult.success) {
        console.log("Validation errors:", parseResult.error.errors);
        const errors = parseResult.error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        return res.status(400).json({ message: "Validation failed", errors });
      }

      const {
        category,
        title,
        description,
        priority,
        source,
        debugInfo: debugInfoStr,
      }: BugReportInput = parseResult.data;

      let debugInfo: DebugInfo | undefined;
      console.log("debugInfoStr:", debugInfoStr);
      if (debugInfoStr) {
        try {
          const parsed = JSON.parse(debugInfoStr);
          console.log("Parsed debug info:", parsed);
          const debugParseResult = debugInfoSchema.safeParse(parsed);
          if (debugParseResult.success) {
            debugInfo = debugParseResult.data;
            console.log("Debug info validated successfully");
          } else {
            console.log(
              "Debug info validation failed:",
              debugParseResult.error.errors,
            );
          }
        } catch (parseError) {
          console.log("Failed to parse debug info JSON:", parseError);
        }
      } else {
        console.log("No debugInfo in request body");
      }

      const jiraClient = axios.create({
        baseURL: JIRA_BASE_URL,
        auth: { username: JIRA_EMAIL, password: JIRA_API_TOKEN },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 60000,
      });

      const adfDescription = buildADFDescription(
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        { category, title, description, priority, source },
        debugInfo,
      );

      const jiraPayload = {
        fields: {
          project: { key: JIRA_PROJECT_KEY },
          summary: `${category}: ${title}`,
          description: adfDescription,
          issuetype: { name: "Task" },
          priority: { name: mapPriority(priority) },
          labels: ["sledge-bug"],
        },
      };

      let issueResponse;
      try {
        issueResponse = await jiraClient.post("/rest/api/3/issue", jiraPayload);
      } catch (err: any) {
        if ((err as AxiosError).code === "ECONNABORTED") {
          console.warn("Jira request timed out, retrying once...");
          issueResponse = await jiraClient.post(
            "/rest/api/3/issue",
            jiraPayload,
          );
        } else {
          throw err;
        }
      }

      const issueKey = issueResponse.data.key;

      const file = (r as any).file;
      if (file) {
        try {
          const blob = new Blob([file.buffer], { type: file.mimetype });
          const formData = new FormData();
          formData.append("file", blob, file.originalname);

          await axios.post(
            `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/attachments`,
            formData,
            {
              auth: { username: JIRA_EMAIL, password: JIRA_API_TOKEN },
              headers: {
                "X-Atlassian-Token": "no-check",
              },
              timeout: 60000,
            },
          );
        } catch (attachmentError: any) {
          console.error("Failed to upload attachment to Jira:", {
            status: attachmentError.response?.status,
            data: attachmentError.response?.data,
            message: attachmentError.message,
          });
        }
      }

      return res.status(201).json({
        success: true,
        issueKey,
        message: "Bug report submitted successfully",
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
          : err.response?.data?.errorMessages?.[0] ||
            err.message ||
            "Failed to create bug report";

      return res.status(500).json({
        message: "Failed to create bug report",
        error: errorMessage,
      });
    }
  };
}

export const reportController = new ReportController();
