import { useEffect, useRef } from "react";

export const useToastHandler = (
    responses: any[],
    setToastMessage: (msg: string) => void,
    setShowAlert: (show: boolean) => void
) => {
    // Ref to keep track of previous responses
    const previousResponsesRef = useRef<any[]>([]);
    useEffect(() => {
        console.log(responses);
        responses.forEach((res, index) => {
            const prevRes = previousResponsesRef.current[index];

            // Only trigger if response exists and changed
            if (res && res !== prevRes) {
                if (res.data) {
                    const { success, message } = res.data;
                    setShowAlert(!success);
                    setToastMessage(message);
                }
                else if (res.error) {
                    setShowAlert(true);
                    setToastMessage(res.error);
                }
            }
        });

        // Update previousResponsesRef after processing
        previousResponsesRef.current = responses;
    }, [responses, setToastMessage, setShowAlert]);
};
