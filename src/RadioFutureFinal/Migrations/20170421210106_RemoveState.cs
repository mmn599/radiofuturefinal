using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RadioFutureFinal.Migrations
{
    public partial class RemoveState : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QueuePosition",
                table: "MyUser");

            migrationBuilder.DropColumn(
                name: "VideoTime",
                table: "MyUser");

            migrationBuilder.DropColumn(
                name: "Waiting",
                table: "MyUser");

            migrationBuilder.DropColumn(
                name: "YTPlayerState",
                table: "MyUser");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "QueuePosition",
                table: "MyUser",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "VideoTime",
                table: "MyUser",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "Waiting",
                table: "MyUser",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "YTPlayerState",
                table: "MyUser",
                nullable: false,
                defaultValue: 0);
        }
    }
}
