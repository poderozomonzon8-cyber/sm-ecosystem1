import { useState } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import {
  Plus, Trash, X, Check, MagnifyingGlass, Note, Paperclip,
  Clock, Briefcase, User,
} from "@phosphor-icons/react";

export default function ProjectNotesPanel() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"notes" | "attachments">("notes");

  const { data: projects  } = useQuery("Project");
  const { data: notes,     isPending: notesLoading     } = useQuery("ProjectNote",      { orderBy: { createdAt: "desc" } });
  const { data: attachments, isPending: attachLoading  } = useQuery("ProjectAttachment",{ orderBy: { createdAt: "desc" } });

  const { create:  createNote,   remove: removeNote,   isPending: notesMutating   } = useMutation("ProjectNote");
  const { create:  createAttach, remove: removeAttach, isPending: attachMutating  } = useMutation("ProjectAttachment");

  const safeProjects     = projects     ?? [];
  const safeNotes        = notes        ?? [];
  const safeAttachments  = attachments  ?? [];

  const activeProject = safeProjects.find(p => p.id === activeProjectId);

  const filteredNotes = safeNotes.filter(n =>
    (!activeProjectId || n.projectId === activeProjectId) &&
    (!search || n.content?.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredAttachments = safeAttachments.filter(a =>
    (!activeProjectId || a.projectId === activeProjectId) &&
    (!search || a.fileName?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    await createNote({
      projectId:   activeProjectId ?? "",
      projectName: activeProject?.title ?? "General",
      content:     noteContent.trim(),
      authorName:  "Admin",
    });
    setNoteContent("");
  };

  const handleAddAttachment = async () => {
    const url = prompt("Paste attachment URL:");
    const fileName = prompt("File name (e.g., invoice.pdf):");
    if (!url || !fileName) return;
    await createAttach({
      projectId:        activeProjectId ?? "",
      projectName:      activeProject?.title ?? "General",
      fileName,
      url,
      fileType:         fileName.split(".").pop() ?? "file",
      uploadedByName:   "Admin",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">Project Notes & Files</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">Progress notes, photo attachments, and project documents.</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Project sidebar */}
        <div className="w-52 flex-shrink-0">
          <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest px-1 mb-2">Projects</p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveProjectId(null)}
              className={`text-left px-3 py-2.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${!activeProjectId ? "bg-charcoal text-white" : "text-gray-500 hover:bg-gray-100"}`}>
              All Projects
            </button>
            {safeProjects.slice(0, 15).map(p => (
              <button key={p.id}
                onClick={() => setActiveProjectId(p.id)}
                className={`text-left px-3 py-2.5 rounded-xl text-xs font-sans truncate transition-all cursor-pointer ${activeProjectId === p.id ? "bg-charcoal text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(["notes", "attachments"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-[11px] font-mono rounded-lg capitalize transition-all cursor-pointer ${tab === t ? "bg-white shadow-sm text-charcoal" : "text-gray-400"}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 ml-auto">
              <MagnifyingGlass size={13} weight="regular" className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="text-xs font-sans focus:outline-none w-28 bg-transparent" />
            </div>
            {tab === "attachments" ? (
              <button onClick={handleAddAttachment}
                className="flex items-center gap-2 px-3 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-gray-800">
                <Paperclip size={12} weight="bold" /> Add File
              </button>
            ) : (
              <button onClick={() => {}} className="hidden" />
            )}
          </div>

          {tab === "notes" && (
            <>
              {/* Note input */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder={`Add a note${activeProject ? ` for ${activeProject.title}` : ""}…`}
                  className="w-full text-sm font-sans text-charcoal focus:outline-none resize-none placeholder:text-gray-300"
                />
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  {activeProject ? (
                    <span className="font-mono text-[10px] text-gray-400 flex items-center gap-1">
                      <Briefcase size={9} /> {activeProject.title}
                    </span>
                  ) : <span />}
                  <button onClick={handleAddNote} disabled={!noteContent.trim() || notesMutating}
                    className="flex items-center gap-1.5 px-4 py-2 bg-charcoal text-white text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-40 hover:bg-gray-800">
                    <Note size={12} weight="bold" /> Add Note
                  </button>
                </div>
              </div>

              {/* Notes list */}
              {notesLoading ? (
                <div className="flex justify-center py-8"><span className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
              ) : filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-gray-200">
                  <Note size={24} weight="regular" className="text-gray-300 mb-2" />
                  <p className="font-sans text-sm text-gray-400">No notes yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredNotes.map(note => (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm group hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {note.projectName && (
                            <span className="px-2 py-0.5 text-[9px] font-mono bg-gray-100 text-gray-500 rounded-full">{note.projectName}</span>
                          )}
                          {note.authorName && (
                            <span className="font-mono text-[10px] text-gray-400 flex items-center gap-1"><User size={9} /> {note.authorName}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-gray-400 flex items-center gap-1"><Clock size={9} /> {new Date(note.createdAt).toLocaleString("en-CA", { dateStyle:"medium", timeStyle:"short" })}</span>
                          <button onClick={() => removeNote(note.id)} disabled={notesMutating}
                            className="w-6 h-6 rounded-lg bg-gray-100 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer">
                            <Trash size={9} weight="regular" className="text-gray-400 group-hover:text-white" />
                          </button>
                        </div>
                      </div>
                      <p className="font-sans text-sm text-charcoal leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "attachments" && (
            <>
              {attachLoading ? (
                <div className="flex justify-center py-8"><span className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
              ) : filteredAttachments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-gray-200">
                  <Paperclip size={24} weight="regular" className="text-gray-300 mb-2" />
                  <p className="font-sans text-sm text-gray-400">No attachments yet. Click "Add File" to upload.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  {filteredAttachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Paperclip size={13} weight="regular" className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-sans text-sm font-medium text-charcoal">{att.fileName}</p>
                          <div className="flex items-center gap-2">
                            {att.projectName && <span className="font-mono text-[10px] text-gray-400">{att.projectName}</span>}
                            {att.fileType && <span className="font-mono text-[10px] text-gray-400 uppercase">{att.fileType}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={att.url} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-mono text-blue-500 hover:text-blue-700 cursor-pointer">View</a>
                        <button onClick={() => removeAttach(att.id)} disabled={attachMutating}
                          className="w-7 h-7 rounded-lg bg-gray-100 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer">
                          <Trash size={10} weight="regular" className="text-gray-400 group-hover:text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
