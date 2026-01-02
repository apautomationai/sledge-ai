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
            const sortBy = (req.query.sortBy as string) || "createdAt";
            const sortOrder = (req.query.sortOrder as string) || "desc";

            // Parse bounds if provided
            let bounds;
            if (req.query.north && req.query.south && req.query.east && req.query.west) {
                bounds = {
                    north: parseFloat(req.query.north as string),
                    south: parseFloat(req.query.south as string),
                    east: parseFloat(req.query.east as string),
                    west: parseFloat(req.query.west as string),
                };
            }

            const result = await projectsServices.getProjects(userId, page, limit, search, sortBy, sortOrder, bounds);

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
            const billingCycle = req.query.billingCycle as string; // 'current', 'full', or specific cycle ID

            if (!userId) {
                throw new BadRequestError("Need a valid userId");
            }

            if (!projectId || isNaN(projectId)) {
                throw new BadRequestError("Need a valid project ID");
            }

            const project = await projectsServices.getProjectById(projectId, userId, billingCycle);

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

    async updateProject(req: Request, res: Response) {
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

            const updateData = req.body;

            // Validate status if provided
            if (updateData.status && !['pending', 'active', 'completed', 'on_hold', 'cancelled'].includes(updateData.status)) {
                throw new BadRequestError("Invalid status. Must be one of: pending, active, completed, on_hold, cancelled");
            }

            // Parse projectStartDate if provided
            if (updateData.projectStartDate) {
                updateData.projectStartDate = new Date(updateData.projectStartDate);
            }

            const updatedProject = await projectsServices.updateProject(projectId, userId, updateData);

            if (!updatedProject) {
                throw new NotFoundError("Project not found");
            }

            return res.status(200).json({
                status: "success",
                message: "Project updated successfully",
                data: updatedProject,
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Failed to update project",
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

    async activateProject(req: Request, res: Response) {
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

            const { projectStartDate, billingCycleStartDate, billingCycleEndDate } = req.body;

            if (!projectStartDate || !billingCycleStartDate || !billingCycleEndDate) {
                throw new BadRequestError("Project start date and billing cycle dates are required");
            }

            const activationData = {
                status: 'active',
                projectStartDate: new Date(projectStartDate),
                billingCycleStartDate: new Date(billingCycleStartDate),
                billingCycleEndDate: new Date(billingCycleEndDate),
            };

            const updatedProject = await projectsServices.updateProject(projectId, userId, activationData);

            if (!updatedProject) {
                throw new NotFoundError("Project not found");
            }

            return res.status(200).json({
                status: "success",
                message: "Project activated successfully",
                data: updatedProject,
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Failed to activate project",
            });
        }
    }

    async getProjectsForMap(req: Request, res: Response) {
        try {
            //@ts-ignore
            const userId = req.user.id;

            if (!userId) {
                throw new BadRequestError("Need a valid userId");
            }

            const projects = await projectsServices.getAllProjectsForMap(userId);

            return res.status(200).json({
                status: "success",
                data: projects,
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                error: error.message || "Failed to get projects for map",
            });
        }
    }
}

export const projectsController = new ProjectsController();
