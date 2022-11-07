package com.uyun.servive;

import com.uyun.domain.Role;
import com.uyun.domain.RoleMenuVo;

import java.util.List;

public interface RoleService {
    public List<Role> findAllRole(Role role);

    //查询菜单关联id
    public List<Integer> findMenuByRoleId(int roleId);

    //为角色分配菜单
    public void roleContextMenu(RoleMenuVo roleMenuVo);
    //删除角色
    public void deleteRole(Integer roleid);


}
