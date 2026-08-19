using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jarvis.Traceability.Api.Migrations.Site
{
    /// <inheritdoc />
    public partial class InitialSiteDbCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "site_process_flows",
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
                    table.PrimaryKey("PK_site_process_flows", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "site_process_steps",
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
                    table.PrimaryKey("PK_site_process_steps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_site_process_steps_site_process_flows_FlowId",
                        column: x => x.FlowId,
                        principalTable: "site_process_flows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "site_process_operations",
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
                    table.PrimaryKey("PK_site_process_operations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_site_process_operations_site_process_steps_StepId",
                        column: x => x.StepId,
                        principalTable: "site_process_steps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "site_station_step_mappings",
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
                    table.PrimaryKey("PK_site_station_step_mappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_site_station_step_mappings_site_process_steps_StepId",
                        column: x => x.StepId,
                        principalTable: "site_process_steps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "site_process_result_definitions",
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
                    table.PrimaryKey("PK_site_process_result_definitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_site_process_result_definitions_site_process_operations_Ope~",
                        column: x => x.OperationId,
                        principalTable: "site_process_operations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_site_process_operations_StepId",
                table: "site_process_operations",
                column: "StepId");

            migrationBuilder.CreateIndex(
                name: "IX_site_process_result_definitions_OperationId",
                table: "site_process_result_definitions",
                column: "OperationId");

            migrationBuilder.CreateIndex(
                name: "IX_site_process_steps_FlowId",
                table: "site_process_steps",
                column: "FlowId");

            migrationBuilder.CreateIndex(
                name: "IX_site_station_step_mappings_StepId",
                table: "site_station_step_mappings",
                column: "StepId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "site_process_result_definitions");

            migrationBuilder.DropTable(
                name: "site_station_step_mappings");

            migrationBuilder.DropTable(
                name: "site_process_operations");

            migrationBuilder.DropTable(
                name: "site_process_steps");

            migrationBuilder.DropTable(
                name: "site_process_flows");
        }
    }
}
