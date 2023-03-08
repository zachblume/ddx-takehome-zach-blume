import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { useRouter } from "next/navigation";

import Link from "next/link";

export default function Home({ searchParams }) {
    // Grab which api we are using from the page query, using Next 13 apprdir format:
    const useSQL = searchParams?.use === "sql";
    const url = "http://localhost:3000/api/" + (useSQL ? "sql" : "json");

    return (
        <main className={inter.className}>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold leading-6 text-gray-900">
                            Colorado 2020 Presidential Primary Winners by County
                        </h1>
                    </div>
                </div>
                <p className="block mt-4 ">
                    Fetching data from the following URL: <Link href={url}>{url}</Link>
                </p>
                <Tabs useSQL={useSQL} />
                <Table url={url} />
            </div>
        </main>
    );
}

async function Table({ url }) {
    const winners = await (await fetch(url)).json();

    return (
        <div className="mt-8 flow-root">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                    >
                                        State
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                    >
                                        County
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                    >
                                        Party
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                    >
                                        Candidate
                                    </th>
                                    <th
                                        scope="col"
                                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                                    >
                                        Votes
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {winners.map((winner) => (
                                    <tr key={winner.state + winner.county + winner.party}>
                                        {Object.keys(winner).map((key) => (
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {winner[key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function Tabs({ useSQL }) {
    const tabs = [
        { name: "Fetch JSON API", href: "/?use=json", current: !useSQL },
        { name: "Fetch SQL API", href: "/?use=sql", current: useSQL },
    ];
    return (
        <div className="mt-5">
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                    Select a tab
                </label>
                {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                <select
                    id="tabs"
                    name="tabs"
                    className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    defaultValue={tabs.find((tab) => tab.current).name}
                >
                    {tabs.map((tab) => (
                        <option key={tab.name}>{tab.name}</option>
                    ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <div className="border-b border-gray-300">
                    <nav className="-mb-px flex" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={
                                    "w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium no-underline" +
                                    (tab.current
                                        ? "border-indigo-500 text-indigo-700"
                                        : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-700")
                                }
                                aria-current={tab.current ? "page" : undefined}
                            >
                                {tab.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}
