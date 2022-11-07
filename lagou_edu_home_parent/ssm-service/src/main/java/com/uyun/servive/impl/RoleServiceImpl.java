package com.uyun.servive.impl;

import com.uyun.dao.RoleMapper;
import com.uyun.domain.Role;
import com.uyun.domain.RoleMenuVo;
import com.uyun.domain.Role_menu_relation;
import com.uyun.servive.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
@Service
public class RoleServiceImpl implements RoleService {
    @Autowired
    private RoleMapper roleMapper;

    @Override
    public List<Role> findAllRole(Role role) {
        List<Role> roles = roleMapper.findAllRole(role);
        return roles;
    }

    @Override
    public List<Integer> findMenuByRoleId(int roleId) {
        List<Integer> roleId1 = roleMapper.findMenuByRoleId(roleId);
        return roleId1;
    }

    @Override
    public void roleContextMenu(RoleMenuVo roleMenuVo) {
        roleMapper.deleteRoleContextMenu(roleMenuVo.getRoleId());
        for (Integer integer : roleMenuVo.getMenuIdList()) {
            Role_menu_relation relation = new Role_menu_relation();
            relation.setMenuId(integer);
            relation.setRoleId(roleMenuVo.getRoleId());
            Date date = new Date();
            relation.setCreatedTime(date);
            relation.setUpdatedTime(date);
            relation.setCreatedBy("lxz");
            relation.setUpdatedby("lxz");
            roleMapper.RoleContextMenu(relation);

        }
    }

    @Override
    public void deleteRole(Integer roleid) {

        roleMapper.deleteRoleContextMenu(roleid);
        roleMapper.deleteRole(roleid);
    }
}
