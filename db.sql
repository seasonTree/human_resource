create database if not exists human_resource default charset utf8 collate utf8_unicode_ci;

-- -----------------------------------------------------
-- 用户
-- -----------------------------------------------------
drop table if exists hs_user;
create table hs_user
(
	id bigint(20) unsigned auto_increment primary key comment '自增id',
    username varchar(64) not null comment '用户名',
	passwd varchar(256) not null comment '密码',
	avatar varchar(60) not null default '' comment '头像',
    personal_name varchar(32) not null default '' comment '姓名',
	phone varchar(11) not null default '' comment '联系电话',
    status tinyint(1) unsigned not null default 0 comment '0: 正常， 1: 禁用',
	ct_user varchar(64) default '' comment '创建人',
	ct_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
	mfy_user varchar(64) default '' comment '修改人',
	mfy_time datetime default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP not null comment '修改时间',
	token varchar(255) not null default '' comment '登录token',
	unique index `user_username` (`username`)
) engine=InnoDB;

insert into hs_user(username, passwd) values('admin', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');

-- -----------------------------------------------------
-- 地区
-- -----------------------------------------------------
drop table if exists hs_place;
create table hs_place
(
	id bigint(20) unsigned auto_increment primary key comment '自增id',
    pl_name varchar(32) default '' not null comment '地区名称',
    pl_prefix varchar(32) default '' not null comment '地区前缀',
    pl_desc varchar(1024) default '' comment '地区描述',
	ct_user varchar(64) default '' comment '创建人',
	ct_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
	mfy_user varchar(64) default '' comment '修改人',
	mfy_time datetime default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP not null comment '修改时间',
	unique index `place_prefix` (`pl_prefix`)
) engine=InnoDB;

-- -----------------------------------------------------
-- 项目
-- -----------------------------------------------------
drop table if exists hs_project;
create table hs_project
(
	id bigint(20) unsigned auto_increment primary key comment '自增id',
    pj_no varchar(32) default '' not null comment '项目编号（编号必须唯一）',
    pj_name varchar(32) default '' not null comment '项目名称',
    pj_desc varchar(1024) default '' comment '项目描述',
    status tinyint(1) unsigned not null default 0 comment '0: 正常， 1: 禁用',
	ct_user varchar(64) default '' comment '创建人',
	ct_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
	mfy_user varchar(64) default '' comment '修改人',
	mfy_time datetime default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP not null comment '修改时间',
	unique index `project_pj_no` (`pj_no`)
) engine=InnoDB;

-- -----------------------------------------------------
-- 用户角色
-- -----------------------------------------------------
drop table if exists hs_role;
create table hs_role
(
	id bigint(20) unsigned auto_increment primary key comment '自增id',
    r_name varchar(32) default '' not null comment '角色名称',
	r_place json default null comment '角色地点，json数据形式',
    status tinyint(1) unsigned not null default 0 comment '0: 正常， 1: 禁用',
	ct_user varchar(64) default '' comment '创建人',
	ct_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
	mfy_user varchar(64) default '' comment '修改人',
	mfy_time datetime default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP not null comment '修改时间',
	token varchar(255) not null default '' comment '登录token',
	unique index `role_r_name` (`r_name`)
) engine=InnoDB;

-- -----------------------------------------------------
-- 用户角色中间表
-- -----------------------------------------------------
drop table if exists hs_role_user;
create table hs_role_user
(
	user_id bigint(20) unsigned not null  comment '用户id',
	role_id	bigint(20) unsigned not null  comment '角色id'
) engine=InnoDB;

-- -----------------------------------------------------
-- 用户角色项目中间表
-- -----------------------------------------------------
drop table if exists hs_role_project;
create table hs_role_project
(
	user_id bigint(20) unsigned not null  comment '用户id',
	project_id	bigint(20) unsigned not null  comment '项目id',
) engine=InnoDB;

-- -----------------------------------------------------
-- 用户权限
-- -----------------------------------------------------
drop table if exists hs_permission;
create table hs_permission
(
	id bigint(20) unsigned auto_increment primary key comment '自增id',
	parent_id bigint(20) not null default 0 comment '父的id',
	p_name varchar(64) not null comment '权限名称',
	p_type tinyint(1) unsigned not null default 0 comment '0: 菜单， 1: 功能',
	p_icon varchar(32) not null default '' comment '菜单图标，按钮不适用',
	url varchar(1024) not null default '' comment '菜单url',
	p_act_name varchar(64) not null default '' comment '功能英文简写，用于前端匹配功能做权限认证，必须英文，例如add,edit, 按钮名称必须唯一',
	p_component varchar(64) not null default '' comment '加载的模块',
	api varchar(1024) not null default '' comment 'api接口',
	idx smallint(4) not null default 0 comment '菜单排序',
	ct_user varchar(64) default '' comment '创建人',
	ct_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
	mfy_user varchar(64) default '' comment '修改人',
	mfy_time datetime default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP not null comment '修改时间'	
) engine=InnoDB;

INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (1, 0, '用户管理', 0, 'fa fa-users', '', '', '/user', '', 19, '', '2018-12-14 14:22:11', 'admin', '2018-12-27 15:20:03');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (2, 1, '用户信息', 0, 'fa fa-user-friends', '/user/index', '', '/user/Index', '', 20, '', '2018-12-14 14:23:25', 'admin', '2018-12-27 15:20:03');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (3, 1, '用户角色', 0, 'fa fa-users-cog', '/user/role', '', '/role/Index', '', 30, '', '2018-12-14 14:24:07', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (4, 1, '用户权限', 0, 'fa fa-user-shield', '/user/permission', '', '/permission/Index', '', 40, '', '2018-12-14 14:24:29', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (5, 2, '查看用户列表', 1, '', '', 'user_list', '', '/api/user/list', 21, '', '2018-12-14 14:26:32', 'admin', '2018-12-27 15:20:03');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (6, 2, '新增用户', 1, '', '', 'user_add', '', '/api/user/add', 22, '', '2018-12-14 14:27:10', 'admin', '2018-12-27 15:20:03');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (7, 2, '修改用户', 1, '', '', 'user_edit', '', '/api/user/edit', 24, '', '2018-12-14 14:27:38', 'admin', '2018-12-27 15:20:03');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (8, 2, '删除用户', 1, '', '', 'user_del', '', '/api/user/del', 25, '', '2018-12-14 14:28:07', 'admin', '2018-12-27 15:20:03');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (9, 2, '修改用户密码', 1, '', '', 'user_change_pass', '', '/api/user/change_user_passwd', 26, '', '2018-12-14 14:29:02', 'admin', '2018-12-27 15:20:03');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (10, 2, '修改用户状态', 1, '', '', 'user_change_status', '', '/api/user/change_status', 27, '', '2018-12-14 14:30:01', 'admin', '2018-12-27 15:20:03');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (11, 3, '查看角色列表', 1, '', '', 'role_list', '', '/api/role/list', 31, '', '2018-12-14 14:32:09', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (12, 2, '查看用户单条记录(修改)', 1, '', '', 'user_get_row', '', '/api/user/get_by_id', 23, '', '2018-12-14 14:33:04', 'admin', '2018-12-27 15:20:03');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (13, 3, '获取角色单条数据(修改)', 1, '', '', 'role_get_row', '', '/api/role/get_by_id', 33, '', '2018-12-14 14:33:51', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (14, 3, '新增角色', 1, '', '', 'role_add', '', '/api/role/add', 32, '', '2018-12-14 14:34:22', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (15, 3, '角色修改', 1, '', '', 'role_edit', '', '/api/role/edit', 34, '', '2018-12-14 14:34:56', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (16, 3, '角色删除', 1, '', '', 'role_del', '', '/api/role/del', 35, '', '2018-12-14 14:35:47', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (17, 3, '设置角色用户', 1, '', '', 'role_user_set', '', '/api/role/set_role_user', 37, '', '2018-12-14 14:44:37', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (18, 3, '设置角色权限', 1, '', '', 'role_permiss_set', '', '/api/role/set_role_permission', 39, '', '2018-12-14 14:46:00', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (19, 3, '获取当前角色的权限(设置使用)', 1, '', '', 'role_permiss_get', '', '/api/role/get_check_permission', 38, '', '2018-12-14 14:47:16', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (20, 3, '获取当前角色的用户列表(设置使用)', 1, '', '', 'role_user_list', '', '/api/role/get_user_by_id', 36, '', '2018-12-14 14:47:56', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (21, 4, '获取权限列表', 1, '', '', 'permiss_list', '', '/api/permission/list', 41, '', '2018-12-14 14:49:12', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (22, 4, '获取权限单条记录(修改)', 1, '', '', 'permiss_get_row', '', '/api/permission/get_by_id', 43, '', '2018-12-14 14:49:55', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (23, 4, '权限新增', 1, '', '', 'permiss_add', '', '/api/permission/add', 42, '', '2018-12-14 14:50:44', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (24, 4, '权限修改', 1, '', '', 'permiss_edit', '', '/api/permission/edit', 44, '', '2018-12-14 14:51:28', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (25, 4, '权限删除', 1, '', '', 'permiss_del', '', '/api/permission/del', 45, '', '2018-12-14 14:52:51', 'admin', '2019-01-05 20:45:58');
INSERT INTO human_resource.hs_permission (id, parent_id, p_name, p_type, p_icon, url, p_act_name, p_component, api, idx, ct_user, ct_time, mfy_user, mfy_time) VALUES (26, 4, '权限排序', 1, '', '', 'permiss_sort', '', '/api/permission/sort', 46, '', '2018-12-14 14:53:22', 'admin', '2019-01-05 20:45:58');

-- -----------------------------------------------------
-- 角色权限
-- -----------------------------------------------------
drop table if exists hs_role_permission;
create table hs_role_permission
(
	role_id bigint(20) unsigned not null comment '角色id',
	p_id  bigint(20) unsigned not null comment '权限id'	
) engine=InnoDB;

-- -----------------------------------------------------
-- 员工资料
-- -----------------------------------------------------
drop table if exists hs_emp;
create table hs_emp
(
	id bigint(20) unsigned auto_increment primary key comment '自增id',
	emp_no varchar(32) not null default '' comment '员工编号, 同和格式为 T+地区+流水号（最少5位），大展为T+地区+最少5位，超过就继续累加，可以超过5位，不够5位就补零',
	emp_type tinyint(1) unsigned not null default 0 comment '0: 正式员工， 1: 劳务员工， 2：实习生',
	emp_name varchar(32) not null default '' comment '员工姓名',
	sex tinyint(1) unsigned not null default 0 comment '0: 男， 1: 女',
	birtplace varchar(32) not null default '' comment '籍贯',
	nationality varchar(32) not null default '' comment '民族',
	marriage tinyint(1) unsigned not null default 0 comment '0: 未婚， 1: 已婚',
	birth_date date default null comment '出生日期',
	age tinyint(2) unsigned not null default 0 comment '年龄',
	identity_no	varchar(32) not null default '' comment '身份证号',
	id_card_address	varchar(32) not null default '' comment '身份证住址',
	emergency_contact varchar(16) not null default '' comment '紧急联系人',
	emergency_contact_phone varchar(32) not null default '' comment '紧急联系电话',
	entry_time date not null comment '入职时间',
	staff_type tinyint(1) unsigned not null default 0 comment '0: 技术， 1: 管理', 
	place_id bigint(20) unsigned not null comment '地区id',
	length_of_service tinyint(2) unsigned not null default 0 comment '司龄', 
	probation tinyint(2) unsigned not null default 0 comment '试用期（以月份为计算）', 
	trial_period_salary unsigned decimal(18,2) default 0 comment '试用期薪资', 
	official_salary unsigned decimal(18,2) default 0 comment '转正薪资', 
	turn_positive_time date not null comment '转正时间', 
	actual_turnaround_time date null comment '实际转正时间',  
	leaving_time date null comment '离职时间', 
	leaving_reason varchar(1024) not null default '' comment '离职原因',
	recruitment_leader_no varchar(32) not null default '' comment '招聘负责人的员工编号',
	is_referral_bonus tinyint(1) unsigned not null default 0 comment '是指推荐人是否有推荐奖，0: 没， 1: 有', 
	payroll_no varchar(32) not null default '' comment '工资卡号',
	account_opening_branch varchar(32) not null default '' comment '开户支行', 
	graduation_time varchar(16) not null default '' comment '毕业时间', 
	graduated_school varchar(32) not null default '' comment '毕业院校',  
	profession varchar(16) not null default '' comment '专业', 
	education varchar(8) not null default '' comment '学历', 
	working_years tinyint(2) unsigned not null default 0 comment '工作年限', 
	contact_number varchar(32) not null default '' comment '联系电话',
	personal_email varchar(32) not null default '' comment '个人邮箱',
	company_email varchar(32) not null default '' comment '公司邮箱',
	annual_leave smallint(6) unsigned not null default 0 comment '年假（H）', 
	change_leave smallint(6) unsigned not null default 0 comment '调休（H）',  
	company_age_leave smallint(6) unsigned not null default 0 comment '司龄假（H）',  
	project_subsidy unsigned decimal(18,2) default 0 comment '调岗工资', 
	assignment_subsidy decimal(18,2) default 0 comment '外派补助/每天',  	
	sign_place_id bigint(20) unsigned not null comment '合同签注地(关联地区id)',
	ct_user varchar(64) default '' null comment '创建人',
	ct_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
	mfy_user varchar(64) default '' null comment '修改人',
	mfy_time datetime default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP not null comment '修改时间'	
	unique index `emp_emp_no` (`emp_no`)
) engine=InnoDB;

-- -----------------------------------------------------
-- 员工资源上传
-- -----------------------------------------------------
drop table if exists hs_emp_file;
create table hs_emp
(
	id bigint(20) unsigned auto_increment primary key comment '自增id',
	emp_id bigint(20) unsigned not null comment '员工id', 
	file_url varchar(1024) not null default '' comment '上传文件的url',
	ct_user varchar(64) default '' null comment '创建人',
	ct_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
) engine=InnoDB;

-- -----------------------------------------------------
-- 员工假期明细表
-- -----------------------------------------------------
-- drop table if exists hs_emp_leave;
-- create table hs_emp_leave
-- (
-- 	id bigint(20) unsigned auto_increment primary key comment '自增id',
-- 	emp_id bigint(20) unsigned not null comment '员工id', 
-- 	leave_type 

-- 	ct_user varchar(64) default '' null comment '创建人',
-- 	ct_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
-- ) engine=InnoDB;



-- -----------------------------------------------------
-- 资产列表
-- -----------------------------------------------------
drop table if exists hs_asset_list;
create table hs_asset_list
(
	id bigint(20) unsigned auto_increment primary key comment '自增id',
	as_no varchar(32) default '' null comment '编号（根据类型生成流水号）',
	as_name varchar(32) default '' null comment '资产名称',
	type_id bigint(20) unsigned not null comment '类型id', 
	deploy varchar(1024) default '' null comment '配置',
	-- 取消这个，因为如果存在报废时间，就表示报废了，如果有员工id，表示正在使用，默认闲置
	--status tinyint(1) unsigned not null default 0 comment '0: 闲置， 1: 使用， 2：报废',
	owner varchar(16) default '' null comment '拥有者，默认大展，不用填',
	use_user_id bigint(20) unsigned null comment '员工的id',
	buy_time date not null comment '购买时间',
	buy_price decimal(18,2) default 0 comment '购买价格',  	
	scrap_time date default null comment '报废时间',
	asset_place_id bigint(20) unsigned not null comment '地区的id',
	ct_user varchar(64) default '' null comment '创建人',
	ct_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
	mfy_user varchar(64) default '' null comment '修改人',
	mfy_time datetime default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP not null comment '修改时间'	
) engine=InnoDB;

-- -----------------------------------------------------
-- 资产类型
-- -----------------------------------------------------
drop table if exists hs_asset_type;
create table hs_asset_type
(
	id bigint(20) unsigned auto_increment primary key comment '自增id',
	as_type varchar(32) default '' null comment '类型名称',
	type_prefix varchar(32) default '' null comment '类型编号前缀（用于生成资产流水号的前缀）',
	type_cur_no int unsigned not null default 0 comment '当前的流水号', 
	remark varchar(1024) not null default '' comment '备注', 
	ct_user varchar(64) default '' null comment '创建人',
	ct_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
	mfy_user varchar(64) default '' null comment '修改人',
	mfy_time datetime default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP not null comment '修改时间'	
) engine=InnoDB;