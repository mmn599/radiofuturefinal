using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace RadioFutureFinal.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.CreateTable(
                name: "Session",
                columns: table => new
                {
                    SessionID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Session", x => x.SessionID);
                });

            migrationBuilder.CreateTable(
                name: "Media",
                columns: table => new
                {
                    MediaID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Description = table.Column<string>(nullable: true),
                    MP3Source = table.Column<string>(nullable: true),
                    OGGSource = table.Column<string>(nullable: true),
                    SessionID = table.Column<int>(nullable: true),
                    Show = table.Column<string>(nullable: true),
                    ThumbURL = table.Column<string>(nullable: true),
                    Title = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Media", x => x.MediaID);
                    table.ForeignKey(
                        name: "FK_Media_Session_SessionID",
                        column: x => x.SessionID,
                        principalTable: "Session",
                        principalColumn: "SessionID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Media_SessionID",
                table: "Media",
                column: "SessionID");

            migrationBuilder.CreateIndex(
                name: "IX_Session_Name",
                table: "Session",
                column: "Name",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Media");

            migrationBuilder.DropTable(
                name: "Session");
        }
    }
}
