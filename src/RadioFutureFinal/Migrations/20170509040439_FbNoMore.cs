using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace RadioFutureFinal.Migrations
{
    public partial class FbNoMore : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MyUser_FacebookId",
                table: "MyUser");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_MyUser_FacebookId",
                table: "MyUser",
                column: "FacebookId");
        }
    }
}
