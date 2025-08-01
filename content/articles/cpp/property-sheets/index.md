---
title: Sharing project properties in Visual C++
date: 2012-01-11
topics:
- cpp
- cpp-cli
- visual-studio
aliases:
- /2012/01/11/sharing-project-properties-in-visual-c/
- /2012/01/sharing-project-properties-in-visual-c/
---

Everyone who has ever created and managed a C++ project in Visual Studio knows that there are hundreds of compiler switches and options to choose from. While setting the desired values for one project may be ok, it's quite time-consuming and error-prone to do this for multiple projects. I'm currently working with a solution containing about 30 or so projects that share most of their project settings. I always wished there was a way to sync or share these common settings among the projects in the solution. Fortunately, there is: *property sheets*. They're a bit hidden though, so I'll explain how to use them in this article.

> [!NOTE]
> This only applies to C++ and C++/CLI projects. .NET projects (C# and Visual Basic) don't have that many options to be tweaked and (therefore?) can't have shared settings.

> [!NOTE]
> This article describes property sheets as they appear in Visual Studio 2010. They may work slightly different in other versions of Visual Studio.

<!--more-->

## The Property Manager

While property sheets (file extension: `.props`) are simply XML files and therefore could be edited with a simple text editor, Visual Studio also provides an editor for property sheets. This editor is available through the so called Property Manager. To display the Property Manager pane, in the menu go to `View` --> `Other Windows` --> `Property Manager`.

> [!NOTE]
Property sheet files share the same XML syntax as `.vcxproj` files.

![Property Manager in main menu](property-manager-in-menu.png)

This will open the Property Manager pane. For just one project (here called `MainConsoleProj`), the contents of the Property Manager will look like this:

![The Property Manager](property-manager-new.png)

Let's examine what you see here:

1. On the top (icon: ![Icon: Project](project-icon.png)) you see our project. If there were more projects in the solution, they'd listed here as well.
1. On the next level there are all configurations of the project on all supported platforms (icon: ![Icon: Configuration](configuration-icon.png)). There are usually the configurations "Debug" and "Release" on the platform "Win32". These are the same configurations you have available in the project settings in the `Configuration` drop-down field. To keep things simply, from now on in this article a configuration-platform combination will be called just "configuration".
1. On the inner-most level you have the actual *property sheets*.

Let's examine the property sheets a bit closer:

* There are two kinds of property sheets. I couldn't find their official names, so let's call them *Base Property Sheets* (icon: ![Icon: Base Property Sheet](base-prop-icon.png)) and *Custom Property Sheets* (icon: ![Icon: Custom Property Sheet](cust-prop-icon.png)). You can edit only custom property sheets. Base property sheets are read-only.
* Property sheets have an order in which they're evaluated. This is important, if two property sheets define a value for the same setting. The order can be seen in the Property Manager and is bottom up. So in the image above, for the "Debug" configuration first `Core Windows Libraries` is evaluated, then `Unicode Support` and so forth. We'll examine the effects of this order a little later.
* Property sheets belong to a certain configuration (such as "Debug|Win32"). The stack of property sheets defines the value that can be inherited for this specific configuration (i.e. that's what you get when you choose `<inherit from parent or project defaults>` for a value in the project settings).

> [!NOTE]
> The property sheet `Microsoft.Cpp.Win32.user` is located somewhere in the current user's application settings. It's contents therefore will be different for each user. By keeping it *the top item* in every configuration you allow the user to override any option, if necessary, without needing to change the project file.

## Creating a shared property sheet

The first step is to create a new property sheet file. To do this, right-click on the project and choose `Add New Project Property Sheet`. This will add a new property sheet to all configurations of the project. In this article, we'll called the file `commons.props` and place it in a directory called `shared-properties` directly in the solution directory.

> [!NOTE]
> You can also right-click on a configuration and choose the same menu item. In this case the new property sheet will only be added to the selected configuration. You can, of course, add this property sheet later to the other configurations as well.

As mentioned before, we want to keep the property sheet `Microsoft.Cpp.Win32.user` the top item in every configuration. So, select an instance of the new property sheets and click on the down arrow in the Property Manager's toolbar. Repeat this also for the property sheet(s) in the other configuration(s).

![Move down](property-manager-move-down.png)

The result then should look like this:

![Result after moving down](property-manager-result.png)

## Editing a property sheet

To edit a property sheet (file), simply double-click on it in the Property Manager.

> [!NOTE]
> The same property sheet file can be listed multiple times in the Property Manager. Editing one "instance" of this file will, of course, update all other "instances" as well (since all "instances" share the same file).

This will pop up a dialog that's very similar to the "Project Settings" dialog of a C++ project. Note that since the property sheet file itself isn't bound to any specified project kind or configuration, the dialog may display more options than are actually available to the project the property sheet is currently associated with.

![The property sheet](property-sheet-editor.png)

Let's demonstrate the effect of a property sheet with compiler switch `Warning Level`. But before we start editing the property sheet, we need to revert this switch's its default value. To do this, open up the project settings for the current project (for example by select the project in the Property Manager and select `Properties` from the context menu). Then select `All Configurations` from the `Configuration` drop-down box and go to `C++` --> `General`. Then make sure that `Warning Level` is inheriting the default value (which should be `Level1 (/W1)`). If it's not, its value will be printed in bold. In this case, click on the down arrow in the value field and select `<inherit from parent or project defaults>` (see screenshot).

![Change warning level](inherit-warning-level.png)

After clicking on `Apply`, the result should look like this:

![Result after clicking "Apply"](warning-level-default-value.png)

Now, again, open the property sheet editor for the `common` property sheet we created earlier. There, set the `Warning Level` to `Level3 (/W3)`. Then click `OK`.

> [!NOTE]
> You may need to save the property sheet manually. For this, use the `Save` button in the Property Manager's toolbar.

When you now open the project's settings again, you should see that the inherited value (not in bold) of `Warning Level` *changed* from level 1 to level 3.

![New default value](default-value-w3.png)

That's the effect of the property sheet. You can define as many settings in a single property sheet file as you want. Then you can add the same property sheet file to multiple project thereby sharing this set of common project settings among all projects.

> [!NOTE]
> A value of a setting specified in a property sheet is only used in a project, when there isn't a custom value (printed in bold) assigned to this setting in the project settings. To take the value of the property sheet (instead of defining a value in the project file), select `<inherit from parent or project defaults>` from the drop-down menu of this setting.

## Property Sheet Order

As mentioned earlier, the property sheets are applied in a certain order - from bottom to top as shown in Property Manager. When editing a property sheet, each setting already displays the inherited value - unless the property sheet defines its own value.

So, lets have a look at the property sheet `Microsoft.Cpp.Win32.user` (in one of the configurations). It still should be *the top item in the stack*. The value for `Warning Level` is already `Level3 (/W3)`. It's inherited from one of the property sheets below - our "common" sheet in this case.

![Inherited default value](user-sheet-above.png)

Now lets swap the `common` sheet with the `Microsoft.Cpp.Win32.user` sheet. This will move the `common` sheet to a position *above* of `Microsoft.Cpp.Win32.user`. Again, open the `Microsoft.Cpp.Win32.user` sheet. The `Warning Level` is now `Level1 (/W1)`, as it's no longer inherited from the `common` sheet. In fact, the `common` sheet now inherits its values from the `Microsoft.Cpp.Win32.user` sheet.

![Result after swapping property sheets](user-sheet-below.png)

## Custom Variables (a.k.a. Macros)

It's possible to define your own custom variables (like the pre-defined `$(OutDir)` or `$(SolutionDir)`). These variables are called "Macros" in Visual Studio. To define one, open the property sheet editor and go to `User Macros`. There, you can add new macros with the `Add Macro` button. These macros then appear in the `Macros` section that is available when editing free text properties (such as paths).

## Inheriting From Other Property Sheets

Property sheets can inherit their values from other property sheets. You can either specify this inheritance ...

* in a *project file*: This is accomplished by adding the inherited property sheet to the Property Manager and move it below the inheriting property sheet.
* in a *property sheet file*: To do this, right-click on the inherit*ing* property sheet file in the Property Manager and choose `Add ... Property Sheet` and select/create the inherit*ed* property sheet. The inherit*ed* property sheet is now being displayed as child node of the inherit*ing* property sheet (see screenshot).

![Property sheet inheritance](inherited-property-sheet.png)

The XML code for inheritance is:

```xml
<ImportGroup Label="PropertySheets">
  <Import Project="commons.props" />
</ImportGroup>
```

## Conditional Properties

Property sheets can also contain *conditional property values*. This means that the value of a property depends on some other value. Usually, this is used to place values for debug and release builds in the same property sheet file. Unfortunately, you can edit these conditions in Visual Studio's property editor. You need to use a text editor.

> [!NOTE]
> When you've modified a property sheet outside of Visual Studio, you need to close the solution(s) it belongs to and reopen them afterwards. Otherwise Visual Studio won't detect the changes to the property sheet.

First, you can define conditions on single properties by using the `Condition` attribute:

```xml
<Optimization Condition="'$(Configuration)|$(Platform)'=='Debug|Win32'">Disabled</Optimization>
```

On the other hand, if you want to group several properties for a certain configuration, you can also add the `Condition` attribute to container elements (here: `<ItemDefinitionGroup>`):

```xml
<ItemDefinitionGroup Condition="'$(Configuration)|$(Platform)'=='Release|Win32'">
  <ClCompile>
    <PreprocessorDefinitions>QT_NO_DEBUG;QT_NO_DEBUG_OUTPUT;NDEBUG;%(PreprocessorDefinitions)</PreprocessorDefinitions>
  </ClCompile>
  <Link>
    <GenerateDebugInformation>false</GenerateDebugInformation>
  </Link>
</ItemDefinitionGroup>
```

You can find more information about conditions in the article ["MSBuild Conditions" on MSDN](http://msdn.microsoft.com/library/7szfhaft.aspx).

## Property Sheet XML Structure

Property sheet files are XML files. The root element is called `<Project>` and in most cases you'll work with the child elements `<ItemDefinitionGroup>` and `<PropertyGroup>`. It's not always clear, in which kind of group to place a certain element. The easiest way to figure this out is to set the desired element in the project settings of a C++ project and then view the project file in a text editor. This is possible because property sheets and C++ project files (`.vcxproj`) use the same XML schema.

Additionally, you can have a look at the [XML tag descriptions on MSDN](http://msdn.microsoft.com/library/5dy88c2e.aspx), although there aren't that descriptive.
