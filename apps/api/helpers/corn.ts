import { config } from "@/lib/config";
import axios from "axios";
import nodeCron from "node-cron";
import { Request, Response } from "express";
import { lienWaiverService } from "@/services/lien-wavier.service";

const fetchEmailsForAllProviders = async () => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

  // Run Gmail and Outlook syncs in parallel
  const [gmailResult, outlookResult] = await Promise.allSettled([
    axios.get(`${backendUrl}/api/v1/google/emails`).catch((error) => {
      console.error('Gmail sync error:', error.message);
      return { data: { success: false, error: error.message } };
    }),
    axios.get(`${backendUrl}/api/v1/outlook/emails`).catch((error) => {
      console.error('Outlook sync error:', error.message);
      return { data: { success: false, error: error.message } };
    }),
  ]);

  if (gmailResult.status === 'fulfilled') {
    console.log('Gmail sync completed');
  } else {
    console.error('Gmail sync failed:', gmailResult.reason);
  }

  if (outlookResult.status === 'fulfilled') {
    console.log('Outlook sync completed');
  } else {
    console.error('Outlook sync failed:', outlookResult.reason);
  }
};

export const startFetchEmails = () => {
  if (config.env !== 'production') {
    console.log('Email cronjob disabled in development mode');
    return;
  }
  console.log('Email cronjob enabled in production mode');
  // every 30 minutes
  nodeCron.schedule("*/30 * * * *", async () => {
    console.log(`Email sync triggered at: ${new Date().toISOString()}`);
    await fetchEmailsForAllProviders();
  });
};

// Cron job for processing the billing cycle
export const processBillingCycle = async (req: Request, res: Response) => {
  const authToken = req.headers['x-cron-token'];
  if (authToken !== process.env.AWS_CRON_JOB_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await lienWaiverService.processAllProjectsBillingCycle();
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
