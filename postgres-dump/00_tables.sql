drop table if exists "NotificationConfiguration";
drop table if exists "UserNotificationSetting";
drop table if exists "SHIFT_TASK_NOTIFICATION";
drop table if exists "SHIFT_NOTIFICATION";
drop table if exists "UserAuthentication";
drop table if exists "Prison";

create table "Prison"
(
    "Id"          integer      not null
        constraint "Prison_pkey"
            primary key,
    "Name"        varchar(50)  not null,
    "Description" varchar(200),
    "ApiUrl"      varchar(256) not null,
    "RegionId"    smallint
);


create table "UserAuthentication"
(
    "QuantumId"                   varchar(50)  not null
        constraint "UserAuthentication_QuantumId_PKey"
            primary key,
    "EmailAddress"                varchar(100),
    "Sms"                         varchar(50),
    "UseEmailAddress"             boolean      not null,
    "UseSms"                      boolean      not null,
    "LastLoginDateTime"           timestamp with time zone,
    "ApiUrl"                      varchar(256) not null,
    "PrisonId"                    integer
        constraint "UserAuthentication_PrisonId_Prison_Id"
            references "Prison",
    "TwoFactorAuthenticationHash" varchar(100),
    "SessionExpiryDateTime"       timestamp
);


create table "SHIFT_NOTIFICATION"
(   "ID"                                 serial                   primary key ,
    "QUANTUM_ID"                         varchar(50)              not null,
    "DESCRIPTION"                        varchar(500),
    "SHIFT_DATE"                         timestamp with time zone not null,
    "LAST_MODIFIED_DATE_TIME"            timestamp with time zone not null,
    "PROCESSED"                          boolean default false    not null,
    "NOTIFICATION_TYPE"                  smallint);


create table "SHIFT_TASK_NOTIFICATION"
(   "ID"                                 serial                   primary key ,
    "QUANTUM_ID"                         varchar(50)              not null,
    "DESCRIPTION"                        varchar(500),
    "TASK_DATE"                          timestamp with time zone not null,
    "TASK_START_TIME_IN_SECONDS"         integer                  not null,
    "TASK_END_TIME_IN_SECONDS"           integer                  not null,
    "ACTIVITY"                           varchar(500),
    "LAST_MODIFIED_DATE_TIME"            timestamp with time zone not null,
    "PROCESSED"                          boolean default false    not null);


create table "UserNotificationSetting"
(
    "QuantumId"       varchar(50) not null
        constraint "UserNotificationSetting_QuantumId"
            primary key
        constraint "UserNotificationSetting_QuantumId_UserAuthentication_QuantumId"
            references "UserAuthentication",
    "EmailAddress"    varchar(50),
    "Sms"             varchar(50),
    "UseEmailAddress" boolean     not null,
    "UseSms"          boolean     not null
);


create table "NotificationConfiguration"
(
    "NotificationConfigurationId" integer generated always as identity
        constraint "NotificationConfiguration_NotificationConfigurationId"
            primary key,
    "PrisonId"                    integer      not null
        constraint "NotificationConfiguration_PrisonId"
            references "Prison",
    "PlanningUnitId"              integer      not null,
    "PlanningUnitName"            varchar(100) not null,
    "ShiftEnabled"                boolean      not null,
    "ShiftTaskEnabled"            boolean      not null,
    "ShiftInterval"               integer      not null,
    "ShiftIntervalType"           smallint     not null,
    "ShiftTaskInterval"           integer      not null,
    "ShiftTaskIntervalType"       smallint     not null,
    "ShiftLastRunDateTime"        timestamp(6),
    "ShiftTaskLastRunDateTime"    timestamp(6)
);
