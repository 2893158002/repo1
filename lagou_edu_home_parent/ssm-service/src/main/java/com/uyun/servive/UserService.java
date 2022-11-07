package com.uyun.servive;

import com.github.pagehelper.PageInfo;
import com.uyun.domain.ResponseResult;
import com.uyun.domain.Role;
import com.uyun.domain.User;
import com.uyun.domain.UserVo;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

public interface UserService {
    public PageInfo findAllUserByPage(UserVo userVo);

    //用户登录
    public User login(User user) throws Exception;
    //根据id查询角色信息
    public List<Role> findUserRelationRoleById(Integer id);

    //用户关联角色
    public void userContextRole(UserVo userVo) throws InvocationTargetException, IllegalAccessException;

    //获取用户权限，进行菜单动态展示
     public ResponseResult getUserPermissions(Integer userid);
}
