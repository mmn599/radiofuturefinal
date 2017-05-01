using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RadioFutureFinal.Migrations
{
    public partial class ForPodcasts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "VideoTitle",
                table: "Media",
                newName: "Title");

            migrationBuilder.AddColumn<string>(
                name: "MP3Source",
                table: "Media",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OGGSource",
                table: "Media",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MP3Source",
                table: "Media");

            migrationBuilder.DropColumn(
                name: "OGGSource",
                table: "Media");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "Media",
                newName: "VideoTitle");
        }
    }
}
