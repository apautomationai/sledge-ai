import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "@/helpers/errors";
import { projectsServices } from "@/services/projects.services";

class ProjectsController {
    async getProjects(req: Request, res: Response) {
        try {
            //@ts-ignore
            const userId = req.user.id;

            if (!userId) {
                throw new BadRequestError("Need a valid userId");
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || "";

            const result = await projectsServices.getProjects(userId, page, limit, search);

            return res.status(200).json({
                status: "success",
                data: result,
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Failed to get projects",
            });
        }
    }

    async getProjectById(req: Request, res: Response) {
        try {
            //@ts-ignore
            const userId = req.user.id;
            const projectId = parseInt(req.params.id);

            if (!userId) {
                throw new BadRequestError("Need a valid userId");
            }

            if (!projectId || isNaN(projectId)) {
                throw new BadRequestError("Need a valid project ID");
            }

            const project = await projectsServices.getProjectById(projectId, userId);

            if (!project) {
                throw new NotFoundError("Project not found");
            }

            return res.status(200).json({
                status: "success",
                data: project,
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Failed to get project",
            });
        }
    }

    async deleteProject(req: Request, res: Response) {
        try {
            //@ts-ignore
            const userId = req.user.id;
            const projectId = parseInt(req.params.id);

            if (!userId) {
                throw new BadRequestError("Need a valid userId");
            }

            if (!projectId || isNaN(projectId)) {
                throw new BadRequestError("Need a valid project ID");
            }

            const deletedProject = await projectsServices.deleteProject(projectId, userId);

            if (!deletedProject) {
                throw new NotFoundError("Project not found");
            }

            return res.status(200).json({
                status: "success",
                message: "Project deleted successfully",
                data: deletedProject,
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Failed to delete project",
            });
        }
    }
}

export const projectsController = new ProjectsController();
