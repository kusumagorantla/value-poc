CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

CREATE TABLE site_process_flows (
    "Id" uuid NOT NULL,
    "ProductId" character varying(100) NOT NULL,
    "FlowCode" character varying(50) NOT NULL,
    "Description" text NOT NULL,
    "SyncStatus" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_site_process_flows" PRIMARY KEY ("Id")
);

CREATE TABLE site_process_steps (
    "Id" uuid NOT NULL,
    "FlowId" uuid NOT NULL,
    "StepCode" integer NOT NULL,
    "StepName" character varying(100) NOT NULL,
    "StepOrder" integer NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_site_process_steps" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_site_process_steps_site_process_flows_FlowId" FOREIGN KEY ("FlowId") REFERENCES site_process_flows ("Id") ON DELETE CASCADE
);

CREATE TABLE site_process_operations (
    "Id" uuid NOT NULL,
    "StepId" uuid NOT NULL,
    "OperationCode" integer NOT NULL,
    "OperationName" character varying(100) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_site_process_operations" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_site_process_operations_site_process_steps_StepId" FOREIGN KEY ("StepId") REFERENCES site_process_steps ("Id") ON DELETE CASCADE
);

CREATE TABLE site_station_step_mappings (
    "Id" uuid NOT NULL,
    "LineCode" character varying(50) NOT NULL,
    "StationCode" character varying(50) NOT NULL,
    "StepId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_site_station_step_mappings" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_site_station_step_mappings_site_process_steps_StepId" FOREIGN KEY ("StepId") REFERENCES site_process_steps ("Id") ON DELETE CASCADE
);

CREATE TABLE site_process_result_definitions (
    "Id" uuid NOT NULL,
    "OperationId" uuid NOT NULL,
    "ResultCode" integer NOT NULL,
    "ResultName" character varying(100) NOT NULL,
    "ResultType" integer NOT NULL,
    "Uom" character varying(20) NOT NULL,
    "Nominal" numeric,
    "Lsl" numeric,
    "Usl" numeric,
    "IsMandatory" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_site_process_result_definitions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_site_process_result_definitions_site_process_operations_Ope~" FOREIGN KEY ("OperationId") REFERENCES site_process_operations ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_site_process_operations_StepId" ON site_process_operations ("StepId");
CREATE INDEX "IX_site_process_result_definitions_OperationId" ON site_process_result_definitions ("OperationId");
CREATE INDEX "IX_site_process_steps_FlowId" ON site_process_steps ("FlowId");
CREATE INDEX "IX_site_station_step_mappings_StepId" ON site_station_step_mappings ("StepId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260817081045_InitialSiteDbCreate', '8.0.2');

COMMIT;
