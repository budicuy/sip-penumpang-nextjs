'use client';
import {
    IconBriefcase,
    IconListCheck,
    IconUsers,
    IconBolt
} from "@tabler/icons-react";

export default function Dashboard() {

    return (
        <>
            <div className="flex justify-between items-center mb-5">
                <h1 className="text-2xl lg:text-4xl font-bold text-black">Dashboard</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-gray-600">Projects</h3>
                        <div className="bg-purple-200 p-2 rounded">
                            <IconBriefcase className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold mt-2">18</p>
                    <p className="text-sm text-gray-500">2 Completed</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-gray-600">Active Task</h3>
                        <div className="bg-purple-200 p-2 rounded">
                            <IconListCheck className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold mt-2">132</p>
                    <p className="text-sm text-gray-500">28 Completed</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-gray-600">Teams</h3>
                        <div className="bg-purple-200 p-2 rounded">
                            <IconUsers className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold mt-2">12</p>
                    <p className="text-sm text-gray-500">1 Completed</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-gray-600">Productivity</h3>
                        <div className="bg-purple-200 p-2 rounded">
                            <IconBolt className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold mt-2">76%</p>
                    <p className="text-sm text-gray-500">5% Completed</p>
                </div>
            </div>

            {/* Active Projects Table */}
            <div className="bg-white p-8 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Active Projects</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-600">
                                <th className="pb-4 text-nowrap">Project Name</th>
                                <th className="pb-4 text-nowrap">Hours</th>
                                <th className="pb-4 text-nowrap">Priority</th>
                                <th className="pb-4 text-nowrap">Members</th>
                                <th className="pb-4 text-nowrap">Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t">
                                <td className="py-4 text-nowrap">Dropbox Design System</td>
                                <td className="py-4 text-nowrap">34</td>
                                <td className="py-4 text-nowrap">
                                    <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-sm">
                                        Medium
                                    </span>
                                </td>
                                <td className="py-4 text-nowrap flex items-center">
                                    <span className="ml-2">+5</span>
                                </td>
                                <td className="py-4 text-nowrap">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: "15%" }}
                                        ></div>
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-t">
                                <td className="py-4 text-nowrap">Slack Team UI Design</td>
                                <td className="py-4 text-nowrap">47</td>
                                <td className="py-4 text-nowrap">
                                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-sm">
                                        High
                                    </span>
                                </td>
                                <td className="py-4 text-nowrap flex items-center">
                                    <span className="ml-2">+5</span>
                                </td>
                                <td className="py-4 text-nowrap">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: "35%" }}
                                        ></div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
