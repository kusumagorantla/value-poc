using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jarvis.Traceability.Api.Migrations.Edge
{
    /// <inheritdoc />
    public partial class InitialEdgeDbCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "edge_process_flows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FlowCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    SyncStatus = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_edge_process_flows", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "process_result_records",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SerialNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StationCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StepCode = table.Column<int>(type: "integer", nullable: false),
                    StationMode = table.Column<int>(type: "integer", nullable: false),
                    StepResult = table.Column<int>(type: "integer", nullable: false),
                    FailureCode = table.Column<string>(type: "text", nullable: false),
                    WpcNo = table.Column<string>(type: "text", nullable: false),
                    MachineTime = table.Column<decimal>(type: "numeric", nullable: true),
                    CycleTime = table.Column<decimal>(type: "numeric", nullable: true),
                    DeviceTimestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StorageMode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_process_result_records", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "recording_audit_logs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientIp = table.Column<string>(type: "text", nullable: false),
                    StorageMode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    LatencyMs = table.Column<double>(type: "double precision", nullable: false),
                    RawPayload = table.Column<string>(type: "jsonb", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recording_audit_logs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "edge_process_steps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowId = table.Column<Guid>(type: "uuid", nullable: false),
                    StepCode = table.Column<int>(type: "integer", nullable: false),
                    StepName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StepOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_edge_process_steps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_edge_process_steps_edge_process_flows_FlowId",
                        column: x => x.FlowId,
                        principalTable: "edge_process_flows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "process_result_values",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RecordId = table.Column<Guid>(type: "uuid", nullable: false),
                    OperationCode = table.Column<int>(type: "integer", nullable: false),
                    ResultCode = table.Column<int>(type: "integer", nullable: false),
                    ValueNumeric = table.Column<decimal>(type: "numeric", nullable: true),
                    ValueText = table.Column<string>(type: "text", nullable: false),
                    ValueFileRef = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_process_result_values", x => x.Id);
                    table.ForeignKey(
                        name: "FK_process_result_values_process_result_records_RecordId",
                        column: x => x.RecordId,
                        principalTable: "process_result_records",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "edge_process_operations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StepId = table.Column<Guid>(type: "uuid", nullable: false),
                    OperationCode = table.Column<int>(type: "integer", nullable: false),
                    OperationName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_edge_process_operations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_edge_process_operations_edge_process_steps_StepId",
                        column: x => x.StepId,
                        principalTable: "edge_process_steps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "edge_station_step_mappings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LineCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StationCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StepId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_edge_station_step_mappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_edge_station_step_mappings_edge_process_steps_StepId",
                        column: x => x.StepId,
                        principalTable: "edge_process_steps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "edge_process_result_definitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OperationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ResultCode = table.Column<int>(type: "integer", nullable: false),
                    ResultName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ResultType = table.Column<int>(type: "integer", nullable: false),
                    Uom = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Nominal = table.Column<decimal>(type: "numeric", nullable: true),
                    Lsl = table.Column<decimal>(type: "numeric", nullable: true),
                    Usl = table.Column<decimal>(type: "numeric", nullable: true),
                    IsMandatory = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_edge_process_result_definitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_edge_process_result_definitions_edge_process_operations_Ope~",
                        column: x => x.OperationId,
                        principalTable: "edge_process_operations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_edge_process_operations_StepId",
                table: "edge_process_operations",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_edge_process_result_definitions_OperationId",
                table: "edge_process_result_definitions",
                column: "OperationId");

            migrationBuilder.CreateIndex(
                name: "IX_edge_process_steps_FlowId",
                table: "edge_process_steps",
                column: "FlowId");

            migrationBuilder.CreateIndex(
                name: "IX_edge_station_step_mappings_StepId",
                table: "edge_station_step_mappings",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_process_result_values_RecordId",
                table: "process_result_values",
                column: "RecordId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "edge_process_result_definitions");

            migrationBuilder.DropTable(
                name: "edge_station_step_mappings");

            migrationBuilder.DropTable(
                name: "process_result_values");

            migrationBuilder.DropTable(
                name: "recording_audit_logs");

            migrationBuilder.DropTable(
                name: "edge_process_operations");

            migrationBuilder.DropTable(
                name: "process_result_records");

            migrationBuilder.DropTable(
                name: "edge_process_steps");

            migrationBuilder.DropTable(
                name: "edge_process_flows");
        }
    }
}
