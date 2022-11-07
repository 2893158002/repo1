package com.uyun.servive;

import com.uyun.domain.Course;
import com.uyun.domain.CourseSection;
import org.springframework.stereotype.Service;

import java.util.List;

public interface CourseContentService {
    public List<CourseSection> findCourseAndLessonByCourseId(Integer courseId);

    //回显课程信息
public Course findCourseByCourseId(int courseId);

//姓曾章节信息
public void saveCurseSection(CourseSection courseSection);

    //修改章节信息
    public void updateCourseSection(CourseSection courseSection);

    //修改章节状态
    public void updateSectionStatus(int id,int status);
}
