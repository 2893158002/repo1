package com.uyun.dao;
import com.uyun.domain.Menu;
import com.uyun.domain.Role;
import com.uyun.domain.Role_menu_relation;

import java.util.List;

public interface RoleMapper {
    public List<Role> findAllRole (Role role);
    //根据角色id查询
    public List<Integer> findMenuByRoleId(int roleId);

    //根据roleid清空中间表信息
    public void  deleteRoleContextMenu(Integer id);

    //为角色分配菜单
    public void RoleContextMenu(Role_menu_relation role_menu_relation);

    //删除角色
    public void deleteRole(Integer id);
    //查询角色信息
    public List<Menu> findAllMenu();
}
