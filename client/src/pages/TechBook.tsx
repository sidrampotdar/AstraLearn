import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FaBook, FaPlus, FaEdit, FaSave, FaRobot, FaSearch } from "react-icons/fa";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { TechNote } from "@shared/schema";

export default function TechBook() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    topic: ""
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["/api/notes", user?.id],
    enabled: !!user?.id,
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: { title: string; content: string; topic: string }) => {
      const response = await apiRequest("POST", "/api/notes", {
        userId: user?.id,
        ...noteData
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", user?.id] });
      setIsCreating(false);
      setNewNote({ title: "", content: "", topic: "" });
      toast({
        title: "Success",
        description: "Note created with AI summary!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive"
      });
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, title, content }: { noteId: number; title: string; content: string }) => {
      const response = await apiRequest("PUT", `/api/notes/${noteId}`, {
        title,
        content
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", user?.id] });
      setEditingNote(null);
      toast({
        title: "Success",
        description: "Note updated with AI summary!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const topics = ["Data Structures", "Algorithms", "System Design", "React", "Node.js", "Database", "Other"];
  
  const filteredNotes = notes.filter((note: TechNote) => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === "all" || note.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const handleCreateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim() || !newNote.topic) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    createNoteMutation.mutate(newNote);
  };

  const handleUpdateNote = (note: TechNote) => {
    const titleElement = document.getElementById(`title-${note.id}`) as HTMLInputElement;
    const contentElement = document.getElementById(`content-${note.id}`) as HTMLTextAreaElement;
    
    if (!titleElement?.value.trim() || !contentElement?.value.trim()) {
      toast({
        title: "Error",
        description: "Title and content cannot be empty",
        variant: "destructive"
      });
      return;
    }

    updateNoteMutation.mutate({
      noteId: note.id,
      title: titleElement.value,
      content: contentElement.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Real-Time TechBook
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Take notes with AI-powered summaries and smart organization
                  </p>
                </div>
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <FaPlus className="mr-2" />
                  New Note
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Create New Note */}
            {isCreating && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Create New Note</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                  <Select value={newNote.topic} onValueChange={(value) => setNewNote({ ...newNote, topic: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Write your notes here..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={8}
                  />
                  <Button
                    onClick={handleCreateNote}
                    disabled={createNoteMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <FaSave className="mr-2" />
                    {createNoteMutation.isPending ? "Creating..." : "Create Note"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Notes Grid */}
            {notesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your notes...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <FaBook className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm || selectedTopic !== "all" ? "No notes found" : "No notes yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || selectedTopic !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Start taking notes to build your personal knowledge base"
                  }
                </p>
                {!searchTerm && selectedTopic === "all" && (
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <FaPlus className="mr-2" />
                    Create Your First Note
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredNotes.map((note: TechNote) => (
                  <Card key={note.id} className="transition-colors">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingNote === note.id ? (
                            <Input
                              id={`title-${note.id}`}
                              defaultValue={note.title}
                              className="font-semibold"
                            />
                          ) : (
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {note.title}
                            </h3>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary">{note.topic}</Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {editingNote === note.id ? (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateNote(note)}
                              disabled={updateNoteMutation.isPending}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <FaSave className="mr-1" />
                              {updateNoteMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingNote(note.id)}
                            >
                              <FaEdit className="mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      {editingNote === note.id ? (
                        <Textarea
                          id={`content-${note.id}`}
                          defaultValue={note.content}
                          rows={8}
                          className="mb-4"
                        />
                      ) : (
                        <div className="prose dark:prose-invert max-w-none mb-4">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                      )}
                      
                      {note.aiSummary && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <FaRobot className="text-blue-500 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                AI Summary
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                                {note.aiSummary}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
