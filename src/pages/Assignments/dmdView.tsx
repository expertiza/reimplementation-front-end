import React, { useEffect, useState } from 'react';

type Contributor = {
    id: number;
    name: string;
    type: 'AssignmentTeam' | 'AssignmentParticipant';
    userId?: number;
    reviewMappings: ReviewMapping[];
};

type ReviewMapping = {
    id: number;
    reviewer: User;
    responses: Response[];
    metareviewers: User[];
};

type User = {
    id: number;
    name: string;
    fullName: string;
};

type Props = {
    assignmentId: number;
    contributors: Contributor[];
    hasSignupSheet: boolean;
};

export const ReviewTable: React.FC<Props> = ({ assignmentId, contributors, hasSignupSheet }) => {
    const [topics, setTopics] = useState<Record<number, string>>({});

    useEffect(() => {
        // In real app, fetch topic info based on contributors
        // setTopics({ contributorId: "Topic 1. AI Ethics", ... })
    }, [contributors]);

    return (
        <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
                <tr>
                    {hasSignupSheet && <th className="w-1/4 p-2">Topic Selected</th>}
                    <th className="w-1/4 p-2">Contributor</th>
                    <th className="w-1/2 p-2">Reviewed / Metareviewed By</th>
                </tr>
            </thead>
            <tbody>
                {contributors.map((contributor, index) => {
                    const bgColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                    const topic = topics[contributor.id] || '—';

                    return (
                        <tr key={contributor.id} className={bgColor}>
                            {hasSignupSheet && <td className="p-2">{topic}</td>}

                            <td className="p-2 align-top">
                                <div className="font-semibold">{contributor.name}</div>
                                <button className="text-red-500 hover:underline mr-2">Delete</button>
                                <button className="text-blue-500 hover:underline mr-2">Add Reviewer</button>
                                <button className="text-yellow-600 hover:underline">Delete Outstanding</button>
                            </td>

                            <td className="p-2 align-top">
                                {contributor.reviewMappings.map((map, i) => {
                                    const isSubmitted = map.responses[map.responses.length - 1]?.isSubmitted;
                                    return (
                                        <div key={map.id} className="mb-4 border-b pb-2">
                                            <div>
                                                Reviewer: {map.reviewer.name} ({map.reviewer.fullName})<br />
                                                Status: {isSubmitted ? 'Submitted' : 'Assigned'}
                                            </div>
                                            <button className="text-red-500 hover:underline mr-2">Delete Reviewer</button>
                                            <button className="text-blue-500 hover:underline mr-2">Add Metareviewer</button>
                                            <button className="text-yellow-600 hover:underline">Delete All Metareviewers</button>

                                            <div className="mt-2 text-sm text-gray-600">
                                                Metareviewers:
                                                <ul className="list-disc ml-4">
                                                    {map.metareviewers.map((meta) => (
                                                        <li key={meta.id}>
                                                            {meta.name} ({meta.fullName}){' '}
                                                            <button className="text-red-500 hover:underline ml-2">Delete</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                })}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};
