package com.uyun.servive.impl;

import com.uyun.dao.CourseContentMapper;
import com.uyun.domain.Course;
import com.uyun.domain.CourseSection;
import com.uyun.servive.CourseContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
@Service
public class CourseContentServiceImpl implements CourseContentService {
   @Autowired
    private CourseContentMapper courseContentMapper;
    @Override
    public List<CourseSection> findCourseAndLessonByCourseId(Integer courseId) {
        List<CourseSection> sectionAndLessonByCourseId = courseContentMapper.findSectionAndLessonByCourseId(courseId);
        return sectionAndLessonByCourseId;
    }

    @Override
    public Course findCourseByCourseId(int courseId) {
        Course course = courseContentMapper.findCourseByCourseId(courseId);
        return course;
    }

    @Override
    public void saveCurseSection(CourseSection courseSection) {
        Date date = new Date();
        courseSection.setCreateTime(date);
        courseSection.setUpdateTime(date);
        courseContentMapper.saveCurseSection(courseSection);
    }

    @Override
    public void updateCourseSection(CourseSection courseSection) {
        courseSection.setUpdateTime(new Date());
        courseContentMapper.updateCurseSection(courseSection);
    }

    @Override
    public void updateSectionStatus(int id, int status) {
        CourseSection courseSection = new CourseSection();
        courseSection.setId(id);
        courseSection.setStatus(status);
        courseSection.setUpdateTime(new Date());

        courseContentMapper.updateSectionStatus(courseSection);
    }
}
