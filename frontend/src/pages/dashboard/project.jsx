import SelectMonth from "@/components/partials/SelectMonth";
import TeamTable from "@/components/partials/Table/team-table";
import CalendarView from "@/components/partials/widget/CalendarView";
import DonutChart from "@/components/partials/widget/chart/donut-chart";
import GroupChart4 from "@/components/partials/widget/chart/group-chart-4";
import MessageList from "@/components/partials/widget/message-list";
import TaskLists from "@/components/partials/widget/task-list";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { files, meets } from "@/constant/data";
import TrackingParcel from "../../components/partials/widget/activity";
import BasicArea from "../chart/appex-chart/BasicArea";
import HomeBredCurbs from "./HomeBredCurbs";

const ProjectPage = () => {
    return (
        <div className="space-y-5">
            <HomeBredCurbs title="Project" />
            <div className="grid grid-cols-12 gap-5">
                <div className="lg:col-span-8 col-span-12 space-y-5">
                    <Card>
                        <div className="grid grid-cols-12 gap-5">
                            <div className="xl:col-span-8 col-span-12">
                                <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-3">
                                    <GroupChart4 />
                                </div>
                            </div>

                            <div className="xl:col-span-4 col-span-12">
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-md p-4">
                                    <span className="block dark:text-slate-400 text-sm text-slate-600">
                                        Progress
                                    </span>
                                    <DonutChart />
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card
                        title="Deal distribution by stage"
                        headerslot={<SelectMonth />}
                    >
                        <BasicArea height={310} />
                    </Card>
                </div>
                <div className="lg:col-span-4 col-span-12 space-y-5">
                    <Card title="Notes">
                        <div className="mb-12">
                            <CalendarView />
                        </div>
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                            {meets.map((item, i) => (
                                <li key={i} className="block py-[10px]">
                                    <div className="flex space-x-2 rtl:space-x-reverse">
                                        <div className="flex-1 flex space-x-2 rtl:space-x-reverse">
                                            <div className="flex-none">
                                                <div className="h-8 w-8">
                                                    <img
                                                        src={item.img}
                                                        alt=""
                                                        className="block w-full h-full object-cover rounded-full border hover:border-white border-transparent"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <span className="block text-slate-600 text-sm dark:text-slate-300 mb-1 font-medium">
                                                    {item.title}
                                                </span>
                                                <span className="flex font-normal text-sm dark:text-slate-400 text-slate-500">
                                                    <span className="text-base inline-block mr-1">
                                                        <Icon icon="heroicons-outline:video-camera" />
                                                    </span>
                                                    {item.meet}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-none">
                                            <span className="block text-sm text-slate-600 dark:text-slate-400">
                                                {item.date}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
            <div className="grid xl:grid-cols-3 grid-cols-1 gap-5">
                <Card title="Task list" headerslot={<SelectMonth />}>
                    <TaskLists />
                </Card>
                <Card title="Messages" headerslot={<SelectMonth />}>
                    <MessageList />
                </Card>
                <Card title="Activity" headerslot={<SelectMonth />}>
                    <TrackingParcel />
                </Card>
            </div>
            <div className="grid grid-cols-12 gap-5">
                <div className="xl:col-span-8 lg:col-span-7 col-span-12">
                    <Card title="Team members" noborder>
                        <TeamTable />
                    </Card>
                </div>
                <div className="xl:col-span-4 lg:col-span-5 col-span-12">
                    <Card title="Files" headerslot={<SelectMonth />}>
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                            {files.map((item, i) => (
                                <li key={i} className="block py-[8px]">
                                    <div className="flex space-x-2 rtl:space-x-reverse">
                                        <div className="flex-1 flex space-x-2 rtl:space-x-reverse">
                                            <div className="flex-none">
                                                <div className="h-8 w-8">
                                                    <img
                                                        src={item.img}
                                                        alt=""
                                                        className="block w-full h-full object-cover rounded-full border hover:border-white border-transparent"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <span className="block text-slate-600 text-sm dark:text-slate-300">
                                                    {item.title}
                                                </span>
                                                <span className="block font-normal text-sm text-slate-500 mt-1">
                                                    {item.date}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-none">
                                            <button
                                                type="button"
                                                className="text-sm text-slate-900 dark:text-white"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProjectPage;
