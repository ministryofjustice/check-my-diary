drop table if exists "NotificationConfiguration";
drop table if exists "UserNotificationSetting";
drop table if exists shift_task_notification;
drop table if exists shift_notification;
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


CREATE TABLE shift_notification
(
    id             SERIAL PRIMARY KEY,
    quantum_id     VARCHAR               NOT NULL,
    shift_date     DATE                  NOT NULL,
    shift_modified TIMESTAMP             NOT NULL,
    task_start     INT,
    task_end       INT,
    task           VARCHAR,
    shift_type     VARCHAR               NOT NULL,
    action_type    VARCHAR               NOT NULL,
    processed      BOOLEAN DEFAULT FALSE NOT NULL
);

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
