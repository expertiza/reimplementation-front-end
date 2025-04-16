import React from 'react';
import { Contributor } from 'utils/interfaces'; 

type Props = {
    assignmentId: number;
    contributors: Contributor[];
    hasSignupSheet: boolean;
};

const ContributorTable: React.FC<Props> = ({ contributors, hasSignupSheet, assignmentId }) => {
    return (
        <table className="w-full border-collapse">
            <thead>
                <tr className="bg-gray-200">
                    {hasSignupSheet && <th className="w-1/5">Topic selected</th>}
                    <th className="w-1/3">Contributor</th>
                    <th className="w-1/3">Reviewed By</th>
                    <th className="w-1/3">Metareviewed By</th>
                </tr>
            </thead>
            <tbody>
                {contributors.map((contributor, i) => {
                    const bgColor = i % 2 === 0 ? 'bg-yellow-50' : 'bg-gray-100';

                    return (
                        <tr key={contributor.id} className={bgColor}>
                            {hasSignupSheet && (
                                <td>
                                    {/* TODO Render topics here */}
                                    {/* TODO precompute or fetch this separately */}
                                </td>
                            )}
                            <td>
                                {contributor.users.map(user => (
                                    <div key={user.id}>
                                        {user.fullName} ({user.name})
                                    </div>
                                ))}
                                <div className="text-right">
                                    <a href={`/participants/delete/${contributor.id}`}>delete</a><br />
                                    <a href={`/review_mapping/select_reviewer/${assignmentId}?contributor_id=${contributor.id}`}>
                                        add reviewer
                                    </a><br />
                                    <a href={`/review_mapping/delete_outstanding_reviewers/${assignmentId}?contributor_id=${contributor.id}`}>
                                        delete outstanding reviewers
                                    </a>
                                </div>
                            </td>
                            <td colSpan={2}>
                                <table className="w-full">
                                    {contributor.reviewMappings.map((map, j) => {
                                        const bg2 = j % 2 === 0 ? 'bg-yellow-100' : 'bg-yellow-200';
                                        return (
                                            <tr key={map.map_id} className={bg2}>
                                                <td className="w-1/2">
                                                    {map.reviewer.name} ({map.reviewer.fullName})
                                                    <div className="text-right">
                                                        Review Status: {map.responseStatus}
                                                        <br />
                                                        <a href="#" className="delete-reviewer-btn" data-id={map.map_id}>delete</a><br />
                                                        <a href={`/metareview_mapping/select_metareviewer/${map.map_id}`}>add metareviewer</a><br />
                                                        <a href={`/metareview_mapping/delete_all_metareviewers/${map.map_id}`}>delete all metareviewers</a>
                                                    </div>
                                                </td>
                                                <td className="w-1/2">
                                                    <table className="w-full">
                                                        {map.metareviewMappings.map((rmap, k) => {
                                                            const bg3 = k % 2 === 0 ? 'bg-white' : 'bg-gray-300';
                                                            return (
                                                                <tr key={rmap.map_id} className={bg3}>
                                                                    <td>
                                                                        {rmap.reviewer.name} ({rmap.reviewer.fullName})
                                                                        <div className="text-right">
                                                                            <a href={`/metareview_mapping/delete_metareviewer/${rmap.map_id}`}>delete</a>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </table>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </table>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default ContributorTable;

