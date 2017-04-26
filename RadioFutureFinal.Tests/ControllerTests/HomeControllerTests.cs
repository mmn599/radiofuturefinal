using Microsoft.AspNetCore.Mvc;
using RadioFutureFinal.Controllers;
using Xunit;

namespace RadioFutureFinal.Tests
{
    public class HomeControllerTests
    {
        [Fact]
        public void IndexReturnsCorrectView()
        {
            var homeController = new HomeController();
            var viewResults = (ViewResult)homeController.Index();
            var viewName = viewResults.ViewName;
            Assert.True(viewName == "Index");
        }

    }
}
