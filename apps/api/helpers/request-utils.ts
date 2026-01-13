/**
 * Utility functions for safely extracting values from Express request objects
 */

import { ParsedQs } from 'qs';

/**
 * Safely extract a string value from req.params or req.query
 * Handles all possible Express.js query/param types
 */
export function getStringParam(value: string | string[] | ParsedQs | ParsedQs[] | (string | ParsedQs)[] | undefined): string {
    if (Array.isArray(value)) {
        return String(value[0] || '');
    }
    if (typeof value === 'object' && value !== null) {
        // Handle ParsedQs object - convert to string
        return String(value);
    }
    return String(value || '');
}

/**
 * Safely extract and parse an integer from req.params or req.query
 */
export function getIntParam(value: string | string[] | ParsedQs | ParsedQs[] | (string | ParsedQs)[] | undefined): number {
    const stringValue = getStringParam(value);
    const parsed = parseInt(stringValue, 10);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Safely extract and parse a float from req.params or req.query
 */
export function getFloatParam(value: string | string[] | ParsedQs | ParsedQs[] | (string | ParsedQs)[] | undefined): number {
    const stringValue = getStringParam(value);
    const parsed = parseFloat(stringValue);
    return isNaN(parsed) ? 0 : parsed;
}