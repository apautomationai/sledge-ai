import { config } from "@/lib/config";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

// Initialize SQS client
const sqsClient = new SQSClient({
  region: config.sqs.region,
  credentials: config.aws.accessKeyId && config.aws.secretAccessKey
    ? {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      }
    : undefined, // If not provided, SDK will try to load from default credential chain
});

/**
 * Send a message to SQS queue
 * @param messageBody - The message body to send
 * @returns Promise<boolean> - true if successful, false if failed
 */
export const sendSQSMessage = async (messageBody: string): Promise<boolean> => {
  try {
    const queueUrl = config.sqs.queueUrl;
    
    if (!queueUrl) {
      console.error("SQS_QUEUE_URL environment variable is not set");
      return false;
    }

    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
    });

    const response = await sqsClient.send(command);
    
    if (response.MessageId) {
      console.log(`SQS message sent successfully. MessageId: ${response.MessageId}`);
      return true;
    } else {
      console.error("Failed to send SQS message: No MessageId returned");
      return false;
    }
  } catch (error) {
    console.error("Error sending SQS message:", error);
    return false;
  }
};

/**
 * Send attachment ID to SQS queue
 * @param attachmentId - The attachment ID to send
 * @returns Promise<boolean> - true if successful, false if failed
 */
export const sendAttachmentMessage = async (attachmentId: number): Promise<boolean> => {
  const messageBody = JSON.stringify({ attachment_id: attachmentId });
  return await sendSQSMessage(messageBody);
};
