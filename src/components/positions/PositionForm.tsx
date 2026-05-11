import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LOCATION_OPTIONS, DURATION_OPTIONS, FIELD_OPTIONS } from "@/types";
import type { Position } from "@/types";

interface PositionFormProps {
  position?: Position;
  onSubmit: (data: PositionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface PositionFormData {
  title: string;
  company: string;
  location: string;
  duration: string;
  field: string;
  description: string;
  requirements: string[];
  salary?: string;
}

export function PositionForm({ position, onSubmit, onCancel, isLoading }: PositionFormProps) {
  const [formData, setFormData] = useState<PositionFormData>({
    title: position?.title || '',
    company: position?.company || '',
    location: position?.location || '',
    duration: position?.duration || '',
    field: position?.field || '',
    description: position?.description || '',
    requirements: position?.requirements || [],
    salary: position?.salary || '',
  });
  const [newSkill, setNewSkill] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.requirements.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter(s => s !== skill),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{position ? 'Edit Position' : 'Create New Position'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div>
            <Label htmlFor="title">Position Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Frontend Developer Intern"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1.5"
              required
            />
          </div>

          {/* Company */}
          <div>
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              placeholder="e.g., TechCorp Vietnam"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="mt-1.5"
              required
            />
          </div>

          {/* Location and Work Type */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Select value={formData.location} onValueChange={(v: string) => setFormData({ ...formData, location: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_OPTIONS.map((option: string) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="field">Field *</Label>
              <Select value={formData.field} onValueChange={(v: string) => setFormData({ ...formData, field: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_OPTIONS.map((option: string) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration and Salary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="duration">Duration *</Label>
              <Select value={formData.duration} onValueChange={(v: string) => setFormData({ ...formData, duration: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((option: string) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                placeholder="e.g., $500 - $800"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and what the intern will learn..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1.5 min-h-[150px]"
              required
            />
          </div>

          {/* Requirements / Skills */}
          <div>
            <Label>Required Skills *</Label>
            <div className="mt-1.5 flex flex-wrap gap-2 mb-3">
              {formData.requirements.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-md bg-[--color-accent] px-2.5 py-1 text-sm font-medium text-[--color-accent-foreground]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-red-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g., React, Python)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.title || !formData.company || !formData.location}>
          {isLoading ? 'Saving...' : position ? 'Update Position' : 'Create Position'}
        </Button>
      </div>
    </form>
  );
}
