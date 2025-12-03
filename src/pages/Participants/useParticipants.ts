import { useCallback, useEffect, useState } from "react";
import useAPI from "../../hooks/useAPI";
import { parseCSV, prettyName } from "./participantHelpers";
import { ALL_ROLES, Participant } from "./participantTypes";

interface UseParticipantsProps {
  assignmentId?: number;
}

export const useParticipants = ({ assignmentId = 1 }: UseParticipantsProps = {}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");

  const {
    error: fetchError,
    isLoading,
    data: participantsResponse,
    sendRequest: fetchParticipants,
  } = useAPI();

  const { error: deleteError, sendRequest: deleteParticipant } = useAPI();

  useEffect(() => {
    fetchParticipants({ url: `/participants/assignment/${assignmentId}` });
  }, [fetchParticipants, assignmentId]);

  useEffect(() => {
    if (participantsResponse && participantsResponse.data) {
      const dataArray = Array.isArray(participantsResponse.data) ? participantsResponse.data : [];

      const apiParticipants = dataArray.map((p: any) => {
        const user = p.user || {};
        const parentUser = user.parent || {};

        return {
          id: p.id,
          name: user.name || p.name || "",
          full_name: user.full_name || p.full_name || "",
          email: user.email || p.email || "",
          role: user.role || p.role || ALL_ROLES[0],
          parent: {
            id: parentUser.id || null,
            name: parentUser.name || null,
          },
          handle: p.handle || null,
          can_submit: p.can_submit || false,
          can_review: p.can_review || false,
          can_take_quiz: p.can_take_quiz || false,
          can_mentor: p.can_mentor || false,
          authorization: p.authorization || "participant",
        };
      });
      setParticipants(apiParticipants);
    }
  }, [participantsResponse]);

  const updateRole = useCallback((id: number, newRoleId: number) => {
    const r = ALL_ROLES.find((x) => x.id === newRoleId) ?? ALL_ROLES[0];
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, role: r } : p)));
  }, []);

  const removeParticipant = useCallback(
    (participantId: number) => {
      deleteParticipant({
        url: `/participants/${participantId}`,
        method: "DELETE",
      });
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    },
    [deleteParticipant]
  );

  const importFromCSV = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) return 0;

      const nextId = (arr: Participant[]) =>
        arr.length ? Math.max(...arr.map((p) => p.id)) + 1 : 1;

      const added: Participant[] = [];
      rows.forEach((cols, i) => {
        const [
          username = "",
          fullName = "",
          email = "",
          parentName = "",
          handle = "",
          roleName = "Participant",
        ] = cols;

        const role =
          ALL_ROLES.find((r) => r.name.toLowerCase() === roleName.toLowerCase()) ?? ALL_ROLES[0];

        added.push({
          id: 0,
          name: username || `user${i}`,
          full_name: fullName || "Last, First",
          email: email || `user${i}@example.edu`,
          role,
          parent: { id: null, name: parentName || null },
          handle,
        });
      });

      setParticipants((prev) => {
        const baseId = nextId(prev);
        const numbered = added.map((p, idx) => ({ ...p, id: baseId + idx }));
        return [...prev, ...numbered];
      });

      return added.length;
    } catch {
      throw new Error("Import failed");
    }
  }, []);

  const exportToCSV = useCallback(() => {
    return participants.map((r) => [
      r.name ?? "",
      prettyName(r.full_name ?? ""),
      r.email ?? "",
      r.parent?.name ?? "",
      r.handle ?? "",
      r.role?.name ?? "",
    ]);
  }, [participants]);

  const filteredParticipants = useCallback(() => {
    if (!searchValue.trim()) return participants;
    const search = searchValue.toLowerCase();
    return participants.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.full_name.toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search) ||
        (p.handle && p.handle.toLowerCase().includes(search)) ||
        (p.parent?.name && p.parent.name.toLowerCase().includes(search))
    );
  }, [participants, searchValue]);

  return {
    participants,
    filteredParticipants: filteredParticipants(),
    searchValue,
    setSearchValue,
    isLoading,
    fetchError,
    deleteError,
    updateRole,
    removeParticipant,
    importFromCSV,
    exportToCSV,
  };
};
