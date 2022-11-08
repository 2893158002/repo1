package com.uyun.dao;

import com.uyun.domain.*;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface UserMapper {
    //用户分页多条件组合查询
    public List<User> findAllUserByPage(UserVo userVo);
    //用户登录 根据用户名查询具体用户信息
    public User login(User user);


    //清空中间表关联关系
    public void deleteUserContextRole(Integer userid);

    //分配角色
    public void userContextRole(User_Role_relation user_role_relation);

    //根据用户id查询角色信息
    public List<Role> findUserRelationRoleById(Integer id);
    //根据id查询角色所拥有的顶级菜单（-1）
    public List<Menu> findParentMenuByRoleId(@Param("list")List<Integer> ids);
    //根据pid查询子菜单信息
    public List<Menu> findSubMenuByPid(Integer pid);
    //获取用户拥有的资源权限信息
    public List<Resource> findResourceByRoleId(List<Integer> ids);
    //获取获取获取
    public List<Resource> findResourceByRoleId1(List<Integer> ids);
    
    
     public void test11();
    public void test22();
    public void test33();
    public void test44();
    public void test52();
    public void test62();
}
