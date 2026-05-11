import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { User, Mail, Phone, BookOpen, Award, FolderOpen, Plus, ExternalLink, Edit2, Save, AlertCircle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/shared/Badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { mockStudentProfile, SKILLS } from "@/data/mockData";
import { studentProfileSchema, type StudentProfileFormValues } from "@/lib/validation";
import { cn } from "@/lib/utils";

const skillCategoryColors: Record<string, string> = {
  Frontend: "bg-indigo-100 text-indigo-700",
  Backend: "bg-emerald-100 text-emerald-700",
  Languages: "bg-amber-100 text-amber-700",
  Database: "bg-violet-100 text-violet-700",
  Design: "bg-pink-100 text-pink-700",
  Tools: "bg-slate-100 text-slate-700",
  DevOps: "bg-orange-100 text-orange-700",
  Cloud: "bg-blue-100 text-blue-700",
  AI: "bg-red-100 text-red-700",
  "Soft Skills": "bg-teal-100 text-teal-700",
};

export function StudentProfilePage() {
  const [profile, setProfile] = useState({
    ...mockStudentProfile,
    skills: mockStudentProfile.skills,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      bio: profile.bio,
      gpa: profile.gpa,
      skills: profile.skills,
    },
  });

  const selectedSkills = watch("skills") || profile.skills;

  const toggleSkill = (skillId: string) => {
    const current = selectedSkills;
    const updated = current.includes(skillId)
      ? current.filter((s) => s !== skillId)
      : [...current, skillId];
    setValue("skills", updated, { shouldValidate: true });
  };

  const getSkillCategory = (skillId: string) => {
    const skill = SKILLS.find((s) => s.id === skillId);
    return skill?.category || "Tools";
  };

  const onValid = (data: StudentProfileFormValues) => {
    setProfile((prev) => ({
      ...prev,
      name: data.name,
      email: data.email,
      phone: data.phone,
      bio: data.bio || "",
      gpa: data.gpa,
      skills: data.skills,
    }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    reset({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      bio: profile.bio,
      gpa: profile.gpa,
      skills: profile.skills,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
          <p className="text-slate-500 mt-1">Quản lý thông tin e-Portfolio của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="text-slate-600 border-slate-300"
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
          )}
          <Button
            onClick={() => (isEditing ? handleSubmit(onValid)() : setIsEditing(true))}
            disabled={isSubmitting}
            variant={isEditing ? "default" : "outline"}
            className={cn(
              isEditing
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : ""
            )}
          >
            {isEditing ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-2" />
                Chỉnh sửa hồ sơ
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      >
        {/* Cover & Avatar */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12">
            <div className="h-24 w-24 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1 pt-2">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    {...register("name")}
                    className="text-xl font-bold max-w-md"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>
              ) : (
                <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
              )}
              <p className="text-slate-500">{profile.major}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {isEditing ? (
                    <Input
                      {...register("email")}
                      className="h-6 w-auto text-sm border-0 bg-transparent p-0 focus:ring-0"
                    />
                  ) : (
                    profile.email
                  )}
                </span>
                {errors.email && isEditing && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {isEditing ? (
                    <>
                      <Input
                        {...register("phone")}
                        className="h-6 w-auto text-sm border-0 bg-transparent p-0 focus:ring-0"
                        placeholder="Chưa cập nhật"
                      />
                      {errors.phone && (
                        <span className="text-xs text-red-500 flex items-center gap-1 ml-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phone.message}
                        </span>
                      )}
                    </>
                  ) : (
                    profile.phone
                  )}
                </span>
              </div>
            </div>

            {/* GPA */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-amber-700 font-medium">GPA</span>
              </div>
              {isEditing ? (
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    {...register("gpa")}
                    className="text-2xl font-bold text-amber-600 text-center"
                  />
                  {errors.gpa && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.gpa.message}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-2xl font-bold text-amber-600">{profile.gpa.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 p-6"
      >
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          Giới thiệu
        </h3>
        {isEditing ? (
          <div>
            <Textarea
              {...register("bio")}
              rows={3}
              placeholder="Viết giới thiệu về bản thân..."
              className={errors.bio ? "border-red-300 focus:ring-red-400" : ""}
            />
            {errors.bio && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.bio.message}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {(watch("bio") || "").length}/500 ký tự
            </p>
          </div>
        ) : (
          <p className="text-slate-600">{profile.bio || "Chưa có giới thiệu"}</p>
        )}
      </motion.div>

      {/* Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 p-6"
      >
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-indigo-500" />
          Kỹ năng
          {errors.skills && (
            <span className="text-xs text-red-500 flex items-center gap-1 ml-2">
              <AlertCircle className="h-3 w-3" />
              {errors.skills.message}
            </span>
          )}
        </h3>

        {isEditing ? (
          <div className="space-y-3">
            {/* Skill category groups */}
            {["Frontend", "Backend", "Languages", "Database", "Design", "Tools", "DevOps", "Cloud", "AI", "Soft Skills"].map((category) => {
              const categorySkills = SKILLS.filter((s) => s.category === category);
              if (categorySkills.length === 0) return null;
              return (
                <div key={category}>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                            isSelected
                              ? "bg-indigo-500 text-white border-indigo-500"
                              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {selectedSkills.length === 0 && (
              <p className="text-sm text-slate-400 italic">Chưa chọn kỹ năng nào</p>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skillId) => {
              const skill = SKILLS.find((s) => s.id === skillId);
              const category = getSkillCategory(skillId);
              return (
                <span
                  key={skillId}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium",
                    skillCategoryColors[category] || "bg-slate-100 text-slate-700"
                  )}
                >
                  {skill?.name || skillId}
                </span>
              );
            })}
            {profile.skills.length === 0 && (
              <p className="text-sm text-slate-400 italic">Chưa cập nhật kỹ năng</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-indigo-500" />
            Dự án đã làm
          </h3>
          {isEditing && (
            <Button size="sm" variant="outline" className="border-dashed">
              <Plus className="h-4 w-4 mr-1" />
              Thêm dự án
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {profile.projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{project.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="default" size="sm">
                        {tech}
                      </Badge>
                    ))}
                    <Badge variant="default" size="sm">
                      {project.year}
                    </Badge>
                  </div>
                </div>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                  >
                    <ExternalLink className="h-5 w-5 text-slate-400" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelEdit}
        title="Huỷ chỉnh sửa?"
        description="Các thay đổi chưa được lưu sẽ bị mất. Bạn có chắc muốn hủy không?"
        confirmLabel="Huỷ chỉnh sửa"
        cancelLabel="Tiếp tục chỉnh sửa"
        variant="warning"
      />
    </div>
  );
}
