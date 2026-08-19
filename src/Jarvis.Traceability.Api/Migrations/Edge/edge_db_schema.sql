CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

CREATE TABLE edge_process_flows (
    "Id" uuid NOT NULL,
    "ProductId" character varying(100) NOT NULL,
    "FlowCode" character varying(50) NOT NULL,
    "Description" text NOT NULL,
    "SyncStatus" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_edge_process_flows" PRIMARY KEY ("Id")
);

CREATE TABLE process_result_records (
    "Id" uuid NOT NULL,
    "SerialNumber" character varying(100) NOT NULL,
    "StationCode" character varying(50) NOT NULL,
    "StepCode" integer NOT NULL,
    "StationMode" integer NOT NULL,
    "StepResult" integer NOT NULL,
    "FailureCode" text NOT NULL,
    "WpcNo" text NOT NULL,
    "MachineTime" numeric,
    "CycleTime" numeric,
    "DeviceTimestamp" timestamp with time zone NOT NULL,
    "StorageMode" character varying(50) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_process_result_records" PRIMARY KEY ("Id")
);

CREATE TABLE recording_audit_logs (
    "Id" uuid NOT NULL,
    "ClientIp" text NOT NULL,
    "StorageMode" character varying(50) NOT NULL,
    "Status" character varying(20) NOT NULL,
    "LatencyMs" double precision NOT NULL,
    "RawPayload" jsonb NOT NULL,
    "ErrorMessage" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_recording_audit_logs" PRIMARY KEY ("Id")
);

CREATE TABLE edge_process_steps (
    "Id" uuid NOT NULL,
    "FlowId" uuid NOT NULL,
    "StepCode" integer NOT NULL,
    "StepName" character varying(100) NOT NULL,
    "StepOrder" integer NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_edge_process_steps" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_edge_process_steps_edge_process_flows_FlowId" FOREIGN KEY ("FlowId") REFERENCES edge_process_flows ("Id") ON DELETE CASCADE
);

CREATE TABLE process_result_values (
    "Id" uuid NOT NULL,
    "RecordId" uuid NOT NULL,
    "OperationCode" integer NOT NULL,
    "ResultCode" integer NOT NULL,
    "ValueNumeric" numeric,
    "ValueText" text NOT NULL,
    "ValueFileRef" text NOT NULL,
    CONSTRAINT "PK_process_result_values" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_process_result_values_process_result_records_RecordId" FOREIGN KEY ("RecordId") REFERENCES process_result_records ("Id") ON DELETE CASCADE
);

CREATE TABLE edge_process_operations (
    "Id" uuid NOT NULL,
    "StepId" uuid NOT NULL,
    "OperationCode" integer NOT NULL,
    "OperationName" character varying(100) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_edge_process_operations" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_edge_process_operations_edge_process_steps_StepId" FOREIGN KEY ("StepId") REFERENCES edge_process_steps ("Id") ON DELETE CASCADE
);

CREATE TABLE edge_station_step_mappings (
    "Id" uuid NOT NULL,
    "LineCode" character varying(50) NOT NULL,
    "StationCode" character varying(50) NOT NULL,
    "StepId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_edge_station_step_mappings" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_edge_station_step_mappings_edge_process_steps_StepId" FOREIGN KEY ("StepId") REFERENCES edge_process_steps ("Id") ON DELETE CASCADE
);

CREATE TABLE edge_process_result_definitions (
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
    CONSTRAINT "PK_edge_process_result_definitions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_edge_process_result_definitions_edge_process_operations_Ope~" FOREIGN KEY ("OperationId") REFERENCES edge_process_operations ("Id") ON DELETE CASCADE
);

CREATE INDEX "IX_edge_process_operations_StepId" ON edge_process_operations ("StepId");
CREATE INDEX "IX_edge_process_result_definitions_OperationId" ON edge_process_result_definitions ("OperationId");
CREATE INDEX "IX_edge_process_steps_FlowId" ON edge_process_steps ("FlowId");
CREATE INDEX "IX_edge_station_step_mappings_StepId" ON edge_station_step_mappings ("StepId");
CREATE INDEX "IX_process_result_values_RecordId" ON process_result_values ("RecordId");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260817081123_InitialEdgeDbCreate', '8.0.2');

COMMIT;
