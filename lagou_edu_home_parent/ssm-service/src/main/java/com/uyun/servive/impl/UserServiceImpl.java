package com.uyun.servive.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.uyun.dao.UserMapper;
import com.uyun.domain.*;
import com.uyun.servive.UserService;
import com.uyun.utils.Md5;
import org.apache.commons.beanutils.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserMapper userMapper;

    @Override
    public PageInfo findAllUserByPage(UserVo userVo) {
        PageHelper.startPage(userVo.getCurrtPage(), userVo.getPageSize());
        List<User> byPage = userMapper.findAllUserByPage(userVo);
        PageInfo<User> info = new PageInfo<>(byPage);
        return info;
    }

    @Override
    public User login(User user) throws Exception {
        User login = userMapper.login(user);
        if (login != null && Md5.verify(user.getPassword(), "lagou", login.getPassword())) {

            return login;
        }else {
            return null;
        }

    }
    //根据id查询角色信息
    @Override
    public List<Role> findUserRelationRoleById(Integer id) {
        List<Role> byId = userMapper.findUserRelationRoleById(id);
        return byId;
    }

    @Override
    public void userContextRole(UserVo userVo) throws InvocationTargetException, IllegalAccessException {
        userMapper.deleteUserContextRole(userVo.getUserId());
        for (Integer integer : userVo.getRoleIdList()) {
            User_Role_relation user_role_relation = new User_Role_relation();
            user_role_relation.setRoleId(integer);
            user_role_relation.setUserId(userVo.getUserId());
            Date date = new Date();
            user_role_relation.setUpdatedTime(date);
            user_role_relation.setCreatedTime(date);
            user_role_relation.setCreatedBy("system");
            user_role_relation.setUpdatedBy("system");
            userMapper.userContextRole(user_role_relation);
        }

    }
//获取用户权限信息
    @Override
    public ResponseResult getUserPermissions(Integer userid) {
        //获取当前用户拥有角色
        List<Role> roleById = userMapper.findUserRelationRoleById(userid);
        ArrayList<Integer> list = new ArrayList<>();
        for (Role role : roleById) {
            list.add(role.getId());
        }
        //根据id查询父菜单
        List<Menu> menuByRoleId = userMapper.findParentMenuByRoleId(list);
        System.out.println("###### menuByRoleId is " + menuByRoleId);
        for (Menu menu : menuByRoleId) {
            List<Menu> subMenuByPid = userMapper.findSubMenuByPid(menu.getId());
        menu.setSubMenuList(subMenuByPid);
        }
        //获取资源信息
        List<Resource> byRoleId = userMapper.findResourceByRoleId(list);
        System.out.println("###### byRoleId is " + byRoleId);
        HashMap<String, Object> map = new HashMap<>();
        map.put("menuList",menuByRoleId);
        map.put("resourceList",byRoleId);
        return new ResponseResult(true,200,"获取用户权限信息成功",map);
    }
}
