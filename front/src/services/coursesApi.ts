import { api as http } from './httpClient';

const BASE = '/api/courses';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  return http<T>(BASE, path, options);
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  level: string;
  imageUrl: string | null;
  duration: number | null;
  published: boolean;
  visibleToRoles: string | null;
  visibleToUsers: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  creator?: { id: number; firstName: string; lastName: string } | null;
  _count?: { modules: number; enrollments: number };
  modules?: CourseModule[];
}

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  order: number;
  createdAt: string;
  materials: CourseMaterial[];
}

export interface CourseMaterial {
  id: number;
  moduleId: number;
  title: string;
  type: string;
  fileUrl: string | null;
  embedUrl: string | null;
  duration: number | null;
  createdAt: string;
}

export interface CourseEnrollment {
  id: number;
  courseId: number;
  userId: number;
  progress: number;
  completed: boolean;
  createdAt: string;
  course: Course;
}

export interface CourseListResponse {
  courses: Course[];
  total: number;
  page: number;
  pageSize: number;
}

export function fetchCourses(params?: Record<string, string>): Promise<CourseListResponse> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/${qs}`);
}

export function fetchAvailableCourses(): Promise<CourseListResponse> {
  return fetchCourses({ pageSize: '100' });
}

export function fetchAllCourses(params?: Record<string, string>): Promise<CourseListResponse> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return api(`/all${qs}`);
}

export function fetchCourse(id: number): Promise<Course> {
  return api(`/${id}`);
}

export interface SearchUser {
  id: number; firstName: string; lastName: string; email: string; role: string;
}

export function searchUsers(q: string): Promise<{ users: SearchUser[] }> {
  return api('/../users/search?q=' + encodeURIComponent(q));
}

export function createCourse(data: { title: string; description?: string; category?: string; level?: string; imageUrl?: string; duration?: number; visibleToRoles?: string; visibleToUsers?: string }): Promise<Course> {
  return api('/', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCourse(id: number, data: any): Promise<Course> {
  return api(`/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function togglePublishCourse(id: number): Promise<Course> {
  return api(`/${id}/publish`, { method: 'PATCH' });
}

export function deleteCourse(id: number): Promise<any> {
  return api(`/${id}`, { method: 'DELETE' });
}

export function addModule(courseId: number, data: { title: string; description?: string }): Promise<CourseModule> {
  return api(`/${courseId}/modules`, { method: 'POST', body: JSON.stringify(data) });
}

export function updateModule(moduleId: number, data: { title?: string; description?: string }): Promise<CourseModule> {
  return api(`/modules/${moduleId}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteModule(moduleId: number): Promise<any> {
  return api(`/modules/${moduleId}`, { method: 'DELETE' });
}

export function addMaterial(moduleId: number, data: { title: string; type?: string; fileUrl?: string; embedUrl?: string; duration?: number }): Promise<CourseMaterial> {
  return api(`/modules/${moduleId}/materials`, { method: 'POST', body: JSON.stringify(data) });
}

export function updateMaterial(id: number, data: any): Promise<CourseMaterial> {
  return api(`/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteMaterial(id: number): Promise<any> {
  return api(`/materials/${id}`, { method: 'DELETE' });
}

export interface EnrollmentWithUser {
  id: number; courseId: number; userId: number; progress: number; completed: boolean; createdAt: string;
  user: { id: number; firstName: string; lastName: string; email: string };
}

export function fetchEnrollmentsByCourse(courseId: number): Promise<EnrollmentWithUser[]> {
  return api(`/${courseId}/enrollments`);
}

export function enrollCourse(id: number): Promise<CourseEnrollment> {
  return api(`/${id}/enroll`, { method: 'POST' });
}

export function fetchMyCourses(): Promise<CourseEnrollment[]> {
  return api('/me/mine');
}

export function updateProgress(courseId: number, progress: number): Promise<CourseEnrollment> {
  return api(`/${courseId}/progress`, { method: 'PATCH', body: JSON.stringify({ progress }) });
}
