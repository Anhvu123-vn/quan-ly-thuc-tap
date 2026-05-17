import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { User, Mail, Phone, BookOpen, Award, FolderOpen, Plus, ExternalLink, Edit2, Save, AlertCircle, X, Check, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/shared/Badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ProjectModal } from "@/components/ui/dialog";
import { SKILLS } from "@/data/mockData";
import { studentProfileSchema, type StudentProfileFormValues } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { toast } from "sonner";

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

interface ProfileData {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  department?: string;
  major?: string;
  gpa?: number;
  skills: string[];
  projects: Project[];
  bio?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
  technologies: string[];
  year: number;
}

export function StudentProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const params = useParams();
  const studentIdFromUrl = params.studentId;
  
  const isViewingOwn = !studentIdFromUrl || studentIdFromUrl === user?.id;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Project editing state
  const [editingProjects, setEditingProjects] = useState<Project[]>([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    link: '',
    technologies: '',
    year: new Date().getFullYear(),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bio: "",
      gpa: 0,
      skills: [],
    },
  });

  const selectedSkills = watch("skills") || [];

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let userData;
      let studentProfileData;

      if (isViewingOwn) {
        [userData, studentProfileData] = await Promise.all([
          api.getProfile(),
          api.getStudentProfile(),
        ]);
      } else {
        [userData, studentProfileData] = await Promise.all([
          api.getStudentById(studentIdFromUrl!),
          api.getStudentProfileById(studentIdFromUrl!),
        ]);
      }

      // Debug: log what we receive
      console.log("userData:", userData);
      console.log("studentProfileData:", studentProfileData);

      // Extract data from response (API returns { success, data })
      const profileRaw = studentProfileData?.data || studentProfileData;
      
      // Parse skills - handle various formats
      let skills: string[] = [];
      const skillsRaw = profileRaw?.skills;
      if (skillsRaw) {
        if (Array.isArray(skillsRaw)) {
          skills = skillsRaw;
        } else if (typeof skillsRaw === 'string') {
          // PostgreSQL array format: {item1,item2} or ["item1","item2"]
          try {
            // Try JSON array first
            const parsed = JSON.parse(skillsRaw);
            skills = Array.isArray(parsed) ? parsed : [];
          } catch {
            // Fallback: parse PostgreSQL array format
            skills = skillsRaw
              .replace(/[{}[\]"]/g, '')
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
        }
      }
      console.log("parsed skills:", skills);

      // Parse projects
      let projects: Project[] = [];
      const projectsRaw = profileRaw?.projects;
      console.log("projectsRaw:", projectsRaw);
      if (projectsRaw) {
        try {
          const dbProjects = Array.isArray(projectsRaw) 
            ? projectsRaw 
            : typeof projectsRaw === 'string' 
              ? JSON.parse(projectsRaw) 
              : [];
          projects = dbProjects.map((p: any, index: number) => ({
            id: p.id || `proj-${index}`,
            title: p.title || p.name || '',
            description: p.description || '',
            link: p.link || p.url,
            technologies: p.technologies || [],
            year: p.year || new Date().getFullYear(),
          }));
        } catch (e) {
          console.error("Error parsing projects:", e);
        }
      }

      const profileData: ProfileData = {
        id: profileRaw?.id || "",
        userId: userData?.data?.id || userData?.id || user.id,
        name: userData?.data?.name || userData?.name || user.name || "",
        email: userData?.data?.email || userData?.email || user.email || "",
        avatar: userData?.data?.avatar || userData?.avatar || user.avatar,
        phone: userData?.data?.phone || userData?.phone || user.phone,
        department: userData?.data?.department || userData?.department || user.department,
        major: profileRaw?.major || profileRaw?.department || userData?.data?.department || userData?.department,
        gpa: profileRaw?.gpa ? Number(profileRaw.gpa) : undefined,
        skills,
        projects,
        bio: profileRaw?.bio,
      };

      setProfile(profileData);
      reset({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone || "",
        bio: profileData.bio || "",
        gpa: profileData.gpa || 0,
        skills: profileData.skills,
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại.");
      
      if (user && isViewingOwn) {
        const fallbackProfile: ProfileData = {
          id: "",
          userId: user.id,
          name: user.name || "",
          email: user.email || "",
          avatar: user.avatar,
          phone: user.phone,
          department: user.department,
          major: user.department,
          gpa: undefined,
          skills: [],
          projects: [],
          bio: "",
        };
        setProfile(fallbackProfile);
        reset({
          name: fallbackProfile.name,
          email: fallbackProfile.email,
          phone: fallbackProfile.phone || "",
          bio: fallbackProfile.bio || "",
          gpa: fallbackProfile.gpa || 0,
          skills: fallbackProfile.skills,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, reset, isViewingOwn, studentIdFromUrl]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toggleSkill = (skillId: string) => {
    const current = selectedSkills;
    const updated = current.includes(skillId)
      ? current.filter((s) => s !== skillId)
      : [...current, skillId];
    setValue("skills", updated, { shouldValidate: true });
  };

  const getSkillCategory = (skillId: string) => {
    // Try to find by id first (lowercase)
    const skillById = SKILLS.find((s) => s.id.toLowerCase() === skillId.toLowerCase());
    if (skillById) return skillById.category;
    
    // Try to find by name (case-insensitive)
    const skillByName = SKILLS.find((s) => s.name.toLowerCase() === skillId.toLowerCase());
    if (skillByName) return skillByName.category;
    
    // Try partial match (e.g., "React" matches "react")
    const skillByPartial = SKILLS.find((s) => 
      s.id.toLowerCase().includes(skillId.toLowerCase()) || 
      s.name.toLowerCase().includes(skillId.toLowerCase())
    );
    return skillByPartial?.category || "Tools";
  };

  // Get skill display name
  const getSkillDisplayName = (skillId: string) => {
    const skillById = SKILLS.find((s) => s.id.toLowerCase() === skillId.toLowerCase());
    if (skillById) return skillById.name;
    
    const skillByName = SKILLS.find((s) => s.name.toLowerCase() === skillId.toLowerCase());
    if (skillByName) return skillByName.name;
    
    return skillId; // Return original if no match
  };

  const onValid = async (data: StudentProfileFormValues) => {
    if (!profile) return;
    
    setIsSaving(true);
    
    try {
      // Update user basic info
      await api.updateStudentUserInfo({
        name: data.name,
        phone: data.phone,
      }).catch((err) => {
        console.error("Failed to update user info:", err);
      });

      // Format data for Prisma - skills as array, projects as JSON
      const profileData: any = {
        bio: data.bio,
        gpa: data.gpa,
        skills: data.skills,
        // Always send projects as JSON string (even if empty array)
        projects: JSON.stringify(editingProjects),
      };

      console.log("Sending profile data:", profileData);

      // Update student profile
      const updateResult = await api.updateStudentProfile(profileData);
      console.log("Profile update result:", updateResult);

      // Update local state
      setProfile((prev) => prev ? {
        ...prev,
        name: data.name,
        email: data.email,
        phone: data.phone,
        bio: data.bio || "",
        gpa: data.gpa,
        skills: data.skills,
        projects: editingProjects,
      } : null);

      // Refresh auth context
      await refreshUser();
      
      // Re-fetch profile to sync with backend data
      await fetchProfile();
      
      setIsEditing(false);
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error("Không thể lưu hồ sơ. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
        bio: profile.bio || "",
        gpa: profile.gpa || 0,
        skills: profile.skills,
      });
      setEditingProjects(profile.projects);
    }
    setIsEditing(false);
  };

  // Project management functions
  const openAddProject = () => {
    setCurrentProject(null);
    setProjectForm({
      title: '',
      description: '',
      link: '',
      technologies: '',
      year: new Date().getFullYear(),
    });
    setProjectModalOpen(true);
  };

  const openEditProject = (project: Project) => {
    setCurrentProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      link: project.link || '',
      technologies: project.technologies.join(', '),
      year: project.year,
    });
    setProjectModalOpen(true);
  };

  const saveProject = () => {
    if (!projectForm.title.trim()) {
      toast.error("Vui lòng nhập tên dự án");
      return;
    }

    const techArray = projectForm.technologies
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const projectData: Project = {
      id: currentProject?.id || `proj-${Date.now()}`,
      title: projectForm.title,
      description: projectForm.description,
      link: projectForm.link || undefined,
      technologies: techArray,
      year: projectForm.year,
    };

    if (currentProject) {
      // Edit existing
      setEditingProjects(prev => 
        prev.map(p => p.id === currentProject.id ? projectData : p)
      );
    } else {
      // Add new
      setEditingProjects(prev => [...prev, projectData]);
    }

    setProjectModalOpen(false);
  };

  const deleteProject = (projectId: string) => {
    setEditingProjects(prev => prev.filter(p => p.id !== projectId));
  };

  // Sync editingProjects when entering edit mode
  useEffect(() => {
    if (isEditing && profile) {
      setEditingProjects(profile.projects);
    }
  }, [isEditing, profile]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-slate-500">Đang tải thông tin hồ sơ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-slate-600">{error}</p>
            <Button onClick={fetchProfile}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isViewingOwn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="pl-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isViewingOwn ? "Hồ sơ cá nhân" : "Hồ sơ sinh viên"}
            </h1>
            <p className="text-slate-500 mt-1">
              {isViewingOwn ? "Quản lý thông tin e-Portfolio của bạn" : "Thông tin e-Portfolio"}
            </p>
          </div>
        </div>
        {isViewingOwn && (
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
            disabled={isSaving}
            variant={isEditing ? "default" : "outline"}
            className={cn(
              isEditing
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : ""
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : isEditing ? (
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
        )}
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
                <h2 className="text-xl font-bold text-slate-900">{profile.name || "Chưa cập nhật"}</h2>
              )}
              <p className="text-slate-500">{profile.major || profile.department || "Chưa cập nhật ngành học"}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {isEditing ? (
                    <Input
                      {...register("email")}
                      className="h-6 w-auto text-sm border-0 bg-transparent p-0 focus:ring-0"
                      disabled
                    />
                  ) : (
                    profile.email || "Chưa cập nhật"
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
                    profile.phone || "Chưa cập nhật"
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
                <p className="text-2xl font-bold text-amber-600">
                  {profile.gpa !== undefined ? profile.gpa.toFixed(2) : "N/A"}
                </p>
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
                      // Case-insensitive match
                      const isSelected = selectedSkills.some(
                        (s) => s.toLowerCase() === skill.id.toLowerCase() || s.toLowerCase() === skill.name.toLowerCase()
                      );
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
                  {getSkillDisplayName(skillId)}
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
            <Button size="sm" variant="outline" className="border-dashed" onClick={openAddProject}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm dự án
            </Button>
          )}
        </div>
        {(isEditing ? editingProjects : profile.projects).length > 0 ? (
          <div className="space-y-4">
            {(isEditing ? editingProjects : profile.projects).map((project, index) => (
              <motion.div
                key={project.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{project.title}</h4>
                    {project.description && (
                      <p className="text-sm text-slate-500 mt-1">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="default" size="sm">
                          {tech}
                        </Badge>
                      ))}
                      {project.year && (
                        <Badge variant="default" size="sm">
                          {project.year}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink className="h-5 w-5 text-slate-400" />
                      </a>
                    )}
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditProject(project)}
                        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Sửa
                      </Button>
                    )}
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteProject(project.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">
            {isEditing ? "Chưa có dự án nào. Nhấn 'Thêm dự án' để bắt đầu." : "Chưa có dự án nào"}
          </p>
        )}
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

      {/* Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={saveProject}
        project={projectForm}
        onChange={(field, value) => setProjectForm(prev => ({ ...prev, [field]: value }))}
        isEditing={!!currentProject}
      />
    </div>
  );
}
