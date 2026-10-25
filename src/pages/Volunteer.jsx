
import { useEffect, useState } from "react";
import { subscribeToRequests, updateStatus } from "../lib/requests";

export default function Volunteer() {
    const [name, setName] = useState("");
    const [enteredName, setEnteredName] = useState("");
    const [tasks, setTasks] = useState([]);
    const [notes, setNotes] = useState({});
    const [message, setMessage] = useState("");
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeToRequests((requests) => {
            setTasks(
                requests.filter(
                    (request) =>
                        request.assignedTo?.trim().toLowerCase() ===
                        enteredName.trim().toLowerCase()
                )
            );
        });

        return () => unsubscribe();
    }, [enteredName]);

    async function changeStatus(task, status) {
        setBusyId(task.id);
        setMessage("");

        try {
            await updateStatus(task.id, status, notes[task.id]);
            setMessage(`Success! Task updated to "${status}".`);
        } catch (error) {
            console.error(error);
            setMessage("Update failed. Please try again.");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <section className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
                <h1 className="mb-2 text-2xl font-bold">HumanLink Volunteer</h1>
                <p className="mb-5 text-gray-600">
                    Enter your name to see tasks assigned to you.
                </p>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        setEnteredName(name.trim());
                        setMessage("");
                    }}
                    className="mb-6 flex flex-wrap gap-3"
                >
                    <input
                        className="min-w-0 flex-1 rounded-lg border p-3"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Volunteer name"
                        required
                    />
                    <button
                        className="rounded-lg bg-blue-600 px-5 py-3 text-white"
                        type="submit"
                    >
                        Find my tasks
                    </button>
                </form>

                {message && (
                    <p role="status" className="mb-4 rounded-lg bg-blue-50 p-3">
                        {message}
                    </p>
                )}

                {enteredName && (
                    <>
                        <h2 className="mb-4 text-xl font-semibold">
                            Tasks for {enteredName}
                        </h2>

                        {tasks.length === 0 ? (
                            <p className="text-gray-600">No tasks assigned to this name.</p>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <article
                                        key={task.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <h3 className="font-bold">
                                            {task.type || "Request"} — {task.urgency || "No urgency"}
                                        </h3>
                                        <p className="my-2">{task.description}</p>
                                        <p className="text-sm text-gray-600">
                                            Location: {task.location || "Not provided"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Status: {task.status}
                                        </p>

                                        <label className="mt-3 block text-sm font-medium">
                                            Optional notes
                                        </label>
                                        <textarea
                                            className="mt-1 w-full rounded-lg border p-2"
                                            value={notes[task.id] || ""}
                                            onChange={(event) =>
                                                setNotes((previous) => ({
                                                    ...previous,
                                                    [task.id]: event.target.value,
                                                }))
                                            }
                                            placeholder="Add a note..."
                                            rows={2}
                                        />

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {task.status === "assigned" && (
                                                <button
                                                    disabled={busyId === task.id}
                                                    onClick={() => changeStatus(task, "accepted")}
                                                    className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
                                                >
                                                    Accept
                                                </button>
                                            )}

                                            {task.status === "accepted" && (
                                                <button
                                                    disabled={busyId === task.id}
                                                    onClick={() => changeStatus(task, "in_progress")}
                                                    className="rounded bg-amber-600 px-3 py-2 text-white disabled:opacity-50"
                                                >
                                                    Start task
                                                </button>
                                            )}

                                            {task.status === "in_progress" && (
                                                <button
                                                    disabled={busyId === task.id}
                                                    onClick={() => changeStatus(task, "resolved")}
                                                    className="rounded bg-green-700 px-3 py-2 text-white disabled:opacity-50"
                                                >
                                                    Mark resolved
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
