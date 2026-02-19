import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Briefcase, Users } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  created_at: string;
  applications_count?: number;
}

const RecruiterDashboard = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    description: "",
  });

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["recruiter-jobs"],
    queryFn: async () => {
      const { data } = await api.get("/recruiter/jobs");
      return data;
    },
  });

  const createJob = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/recruiter/jobs", form);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      toast.success("Job posted!");
      setShowForm(false);
      setForm({ title: "", company: "", location: "", type: "Full-time", description: "" });
    },
    onError: () => toast.error("Failed to post job"),
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Recruiter Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your job postings</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Post a Job
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">New Job Posting</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createJob.mutate();
              }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Job title</Label>
                <Input id="title" value={form.title} onChange={update("title")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={form.company} onChange={update("company")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={update("location")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={form.type}
                  onChange={update("type")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Remote</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} value={form.description} onChange={update("description")} required />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createJob.isPending}>
                  {createJob.isPending ? "Posting…" : "Post Job"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted/50" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Briefcase className="mx-auto h-10 w-10 mb-3 opacity-40" />
          <p className="text-lg">No jobs posted yet</p>
          <p className="text-sm mt-1">Click "Post a Job" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-lg border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {job.company} · {job.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {job.applications_count !== undefined && (
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {job.applications_count}
                    </Badge>
                  )}
                  <Badge variant="secondary">{job.type}</Badge>
                </div>
              </div>
              <Separator className="my-3" />
              <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
