import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminHealthRecordApi } from "../services";
import type { SystemHealthStat } from "../types";

export function SystemStatisticsChart() {
  const [data, setData] = useState<SystemHealthStat[]>([]);
  const [loading, setLoading] = useState(true);

  // Mặc định lấy 30 ngày qua
  const defaultTo = new Date();
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const [fromDate, setFromDate] = useState<string>(defaultFrom.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(defaultTo.toISOString().split('T')[0]);

  useEffect(() => {
    setLoading(true);
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    // Set 'to' date to the end of the day
    to.setHours(23, 59, 59, 999);

    adminHealthRecordApi.getSystemStatistics(from, to)
      .then((res) => {
        const formattedData = res.data?.map(item => ({
          ...item,
          displayDate: new Date(item.statDate).toLocaleDateString("vi-VN")
        })) || [];
        setData(formattedData);
      })
      .catch(err => console.error("Error fetching system stats", err))
      .finally(() => setLoading(false));
  }, [fromDate, toDate]);

  return (
    <Card className="col-span-full mb-6">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <CardTitle>System Health Overview</CardTitle>
          <CardDescription>Daily aggregation of all user heart rate classifications</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Input 
            type="date" 
            value={fromDate} 
            onChange={(e) => setFromDate(e.target.value)} 
            className="w-auto"
          />
          <span className="text-neutral-500">-</span>
          <Input 
            type="date" 
            value={toDate} 
            onChange={(e) => setToDate(e.target.value)} 
            className="w-auto"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center text-neutral-500">Loading statistics...</div>
        ) : data.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center text-neutral-500">
            Không có dữ liệu thống kê nào trong khoảng thời gian đã chọn.
          </div>
        ) : (
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="displayDate" tickLine={false} axisLine={false} tickMargin={8} minTickGap={30} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Line type="monotone" name="Normal" dataKey="totalNormal" stroke="#22c55e" strokeWidth={3} dot={false} />
                <Line type="monotone" name="AFib" dataKey="totalAfib" stroke="#ef4444" strokeWidth={3} dot={false} />
                <Line type="monotone" name="Uncertain" dataKey="totalUncertain" stroke="#eab308" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
