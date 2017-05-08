using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace RadioFutureFinal.Migrations
{
    public partial class FbUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Media_MyUser_MyUserId",
                table: "Media");

            migrationBuilder.DropIndex(
                name: "IX_Media_MyUserId",
                table: "Media");

            migrationBuilder.DropColumn(
                name: "MyUserId",
                table: "Media");

            migrationBuilder.AddColumn<int>(
                name: "FacebookId",
                table: "MyUser",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "SessionHistory",
                columns: table => new
                {
                    SessionHistoryID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    MyUserId = table.Column<int>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    SessionID = table.Column<int>(nullable: false),
                    URL = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionHistory", x => x.SessionHistoryID);
                    table.ForeignKey(
                        name: "FK_SessionHistory_MyUser_MyUserId",
                        column: x => x.MyUserId,
                        principalTable: "MyUser",
                        principalColumn: "MyUserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SessionHistory_MyUserId",
                table: "SessionHistory",
                column: "MyUserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SessionHistory");

            migrationBuilder.DropColumn(
                name: "FacebookId",
                table: "MyUser");

            migrationBuilder.AddColumn<int>(
                name: "MyUserId",
                table: "Media",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Media_MyUserId",
                table: "Media",
                column: "MyUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Media_MyUser_MyUserId",
                table: "Media",
                column: "MyUserId",
                principalTable: "MyUser",
                principalColumn: "MyUserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
