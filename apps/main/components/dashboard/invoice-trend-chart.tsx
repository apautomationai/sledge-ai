"use client";

import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import client from "@/lib/axios-client";

interface InvoiceTrendChartProps {
    dateRange: string;
}

interface TrendData {
    name: string;
    invoices: number;
    amount: number;
}

export default function InvoiceTrendChart({ dateRange }: InvoiceTrendChartProps) {
    const [data, setData] = useState<TrendData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrendData = async () => {
            setIsLoading(true);
            try {
                const response: any = await client.get(
                    `api/v1/invoice/trends?dateRange=${dateRange}`
                );

                // The axios client returns response.data directly
                // Backend sends: { success: true, data: [...] }
                // Axios client returns: { success: true, data: [...] }
                // So response.data is the array we want
                if (response?.data && Array.isArray(response.data)) {
                    setData(response.data);
                } else if (response && Array.isArray(response)) {
                    // Fallback in case response structure is different
                    setData(response);
                } else {
                    console.warn("Unexpected response structure:", response);
                    setData([]);
                }
            } catch (error) {
                console.error("Failed to fetch trend data:", error);
                // Fallback to empty data
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrendData();
    }, [dateRange]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Trends</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {dateRange === 'monthly' ? 'Weekly breakdown for current month' : 'All-time yearly data'}
                    </p>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">Loading trend data...</p>
                </CardContent>
            </Card>
        );
    }

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Trends</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {dateRange === 'monthly' ? 'Weekly breakdown for current month' : 'All-time yearly data'}
                    </p>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">No trend data available</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invoice Trends</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {dateRange === 'monthly' ? 'Weekly breakdown for current month' : 'All-time yearly data'}
                </p>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            style={{ fontSize: "12px" }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: "12px" }}
                            yAxisId="left"
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: "12px" }}
                            yAxisId="right"
                            orientation="right"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "1px solid #374151",
                                borderRadius: "8px",
                            }}
                            formatter={(value: any, name: string) => [
                                name === "Total Amount ($)"
                                    ? `$${Number(value).toLocaleString()}`
                                    : value,
                                name
                            ]}
                        />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="invoices"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: "#3b82f6", r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Invoice Count"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="amount"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: "#10b981", r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Total Amount ($)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
