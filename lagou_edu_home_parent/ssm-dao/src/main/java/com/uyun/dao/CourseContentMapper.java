package com.uyun.dao;

import com.uyun.domain.Course;
import com.uyun.domain.CourseLesson;
import com.uyun.domain.CourseSection;

import java.util.List;

public interface CourseContentMapper {
    public List<CourseSection> findSectionAndLessonByCourseId(Integer courseId);

    //回显课程信息
    public Course findCourseByCourseId(int courseId);

    //新增章节信息
    public void saveCurseSection(CourseSection courseSection);
    //修改章节信息
    public void updateCurseSection(CourseSection courseSection);
    //修改章节状态
    public void updateSectionStatus(CourseSection courseSection);
}
