import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, FileText, Loader2 } from "lucide-react";

const ApplyJob = () => {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResume(file);

    if (file.type === "application/pdf") {
      setParsing(true);
      try {
        const formData = new FormData();
        formData.append("resume", file);
        const { data } = await api.post("/parse-resume", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setForm((prev) => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
        }));
        toast.success("Resume parsed — fields auto-filled");
      } catch {
        toast.info("Could not auto-fill from resume");
      } finally {
        setParsing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please sign in to apply");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("coverLetter", form.coverLetter);
      if (resume) formData.append("resume", resume);

      await api.post(`/jobs/${id}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Application submitted!");
      navigate("/");
    } catch {
      toast.error("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="container py-8 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Apply for this position</CardTitle>
          <CardDescription>
            Upload your resume to auto-fill, then review and submit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Resume Upload */}
            <div className="space-y-2">
              <Label>Resume (PDF)</Label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed p-4 transition-colors hover:border-accent hover:bg-muted/50">
                {parsing ? (
                  <Loader2 className="h-5 w-5 animate-spin text-accent" />
                ) : resume ? (
                  <FileText className="h-5 w-5 text-accent" />
                ) : (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {parsing
                    ? "Parsing resume…"
                    : resume
                    ? resume.name
                    : "Click to upload your resume"}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={update("name")} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={update("email")} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover letter</Label>
              <Textarea
                id="coverLetter"
                rows={5}
                placeholder="Why are you a great fit for this role?"
                value={form.coverLetter}
                onChange={update("coverLetter")}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyJob;
