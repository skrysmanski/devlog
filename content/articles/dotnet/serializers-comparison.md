---
title: .NET Serializers Comparison Chart
date: 2014-10-30
topics:
- dotnet
- serializers
---

There are many object serializers in C#/.NET but their details are often not so obvious, for example:

* Does my class need a parameterless constructor?
* Can I serialize `private` fields?
* Can I serialize `readonly` fields?

So, I've compiled a comparison chart in this article that will compare the various serializers and their capabilities.

<!--more-->

The following serializers will be compared:

| Name                                                                                 | Abbreviation | Version      | Output Format |
| ------------------------------------------------------------------------------------ | ------------ | ------------ | ------------- |
| [BinaryFormatter](http://msdn.microsoft.com/EN-US/library/y50tb888.aspx)             | BF           | (.NET 4.5.1) | Binary        |
| [DataContractSerializer](http://msdn.microsoft.com/EN-US/library/ms405768.aspx)      | DCS          | (.NET 4.5.1) | XML           |
| [NetDataContractSerializer](http://msdn.microsoft.com/EN-US/library/ms574991.aspx)   | NDCS         | (.NET 4.5.1) | XML           |
| [XmlSerializer](http://msdn.microsoft.com/EN-US/library/swxzdhc0.aspx)               | XMLSer       | (.NET 4.5.1) | XML           |
| [DataContractJsonSerializer](http://msdn.microsoft.com/EN-US/library/bb908432.aspx)  | DCJS         | (.NET 4.5.1) | JSON          |
| [Newtonsoft.JSON](http://james.newtonking.com/json)                                  | Newtonsoft   | 6.0.5        | JSON          |

## Testing Framework

I wrote a small framework to do most of the tests in this article.

```note
Unfortunately, the code got lost when BitBucket nuked its Mercurial projects.
```

You may also want to have a look at it when some feature isn't clear to you.

## General Capabilities

| Feature                                                               | BF     | DCS   | NDCS   | XMLSer  | DCJS   | Newtonsoft |
| --------------------------------------------------------------------- | ------ | ----- | ------ | ------- | ------ | ---------- |
| Serialized size of 1 example object (bytes)                           | 322    | 253   | 456    | 273     | 54     | 57         |
| Serialized size of 500 example objects (bytes)                        | 18.583 | 68.679| 76.397 | 81.687  | 27.501 | 33.396     |
| Can serialize unattributed class                                      | no     | yes   | yes    | yes     | yes    | yes        |
| Supports `[Serializable]` and `[NonSerializable]`                     | yes    | yes   | yes    | no      | yes    | yes        |
| Supports `[DataContract]`                                             | no     | yes   | yes    | no      | yes    | yes        |
| Can mix attributed and unattributed members                           | -      | yes   | yes    | -       | yes    | yes        |
| Respects `[OnDeserialized]` and related (unattributed)                | -      | yes   | yes    | no      | yes    | yes        |
| Respects `[OnDeserialized]` and related (`[Serializable]`)            | yes    | yes   | yes    | -       | yes    | yes        |
| Respects `[OnDeserialized]` and related (`[DataContract]`)            | -      | yes   | yes    | -       | yes    | yes        |

**Notes on features:**

* A dash (`-`) means "not applicable". For example, `BinaryFormatter` can only serialize classes that are attributed with `[Serializable]`. So, it doesn't make sense to check whether it calls the parameterless constructor on a `[DataContract]` class.
* **Can serialize unattributed class:** Serializers that can't serialize unattributed classes are a bad choice if you want to serialize types that are not attributed (with `[Serializable]` or `[DataContract]`) and for which you don't have access to the code (e.g. some library types).
* For `[OnDeserialization]`, see [Version-Tolerant Serialization Callbacks](http://msdn.microsoft.com/en-us/library/ms733734%28v=vs.110%29.aspx).
  * Tests were done with the attributed methods being `private`.

**Notes on serializers:**

* The `XmlSerializer` treats all classes as if they were not attributed.
* Newtonsoft.JSON serializer settings used:
  * `ReferenceLoopHandling = ReferenceLoopHandling.Serialize`
  * `PreserveReferencesHandling = PreserveReferencesHandling.Objects` (without this, the serializer can't detect reference loops and creates stack overflows)

## Class/Type Features

| Feature                                                               | BF     | DCS   | NDCS   | XMLSer  | DCJS   | Newtonsoft |
| --------------------------------------------------------------------- | ------ | ----- | ------ | ------- | ------ | ---------- |
| Can serialize private class (unattributed)                            | -      | no    | no     | no      | no     | yes        |
| Can serialize private class (`[Serializable]`)                        | yes    | yes   | yes    | -       | yes    | yes        |
| Can serialize private class (`[DataContract]`)                        | -      | yes   | yes    | -       | yes    | yes        |
| Needs parameterless constructor (unattributed)                        | -      | yes   | yes    | yes     | yes    | no         |
| Needs parameterless constructor (`[Serializable]`)                    | no     | no    | no     | -       | no     | no         |
| Needs parameterless constructor (`[DataContract]`)                    | -      | no    | no     | -       | no     | no         |
| Can deserialize class with private constructor (unattributed)         | -      | no    | no     | no      | no     | no         |
| Can deserialize class with private constructor (`[Serializable]`)     | yes    | yes   | yes    | -       | yes    | no         |
| Can deserialize class with private constructor (`[DataContract]`)     | -      | yes   | yes    | -       | yes    | no         |
| Calls parameterless constructor (unattributed)                        | -      | yes   | yes    | yes     | yes    | yes        |
| Calls parameterless constructor (`[Serializable]`)                    | no     | no    | no     | -       | no     | yes        |
| Calls parameterless constructor (`[DataContract]`)                    | -      | no    | no     | -       | no     | yes        |

**Notes on features:**

* For how serializers can deserialize an object without calling the constructor, see [this Stack Overflow answer](http://stackoverflow.com/a/1076735/614177).

## Fields and Properties

| Feature                                                               | BF     | DCS   | NDCS   | XMLSer  | DCJS   | Newtonsoft |
| --------------------------------------------------------------------- | ------ | ----- | ------ | ------- | ------ | ---------- |
| Can serialize `private` fields (Unattributed)                         | -      | no    | no     | no      | no     | no         |
| Can serialize `private` fields (`[Serializable]`)                     | yes    | yes   | yes    | -       | yes    | no         |
| Can serialize `private` fields (`[DataContract]`)                     | -      | yes   | yes    | -       | yes    | yes        |
| Can serialize `readonly` fields (Unattributed)                        | -      | no    | no     | no      | no     | no         |
| Can serialize `readonly` fields (`[Serializable]`)                    | yes    | yes   | yes    | -       | yes    | no         |
| Can serialize `readonly` fields (`[DataContract]`)                    | -      | yes   | yes    | -       | yes    | yes        |
| Calls property getter and setter when serializing (unattributed)      | -      | yes   | yes    | yes     | yes    | yes        |
| Calls property getter and setter when serializing (`[Serializable]`)  | no     | no    | no     | -       | no     | yes        |
| Calls property getter and setter when serializing (`[DataContract]`)  | -      | yes   | yes    | -       | yes    | yes        |
| Calls private setter when deserializing (unattributed)                | -      | no    | no     | no      | no     | no         |
| Calls private setter when deserializing (`[Serializable]`)            | -      | -     | -      | -       | -      | no         |
| Calls private setter when deserializing (`[DataContract]`)            | -      | yes   | yes    | -       | yes    | yes        |

## Deserialization Type Restrictions

| Feature                                                               | BF     | DCS   | NDCS   | XMLSer  | DCJS   | Newtonsoft |
| --------------------------------------------------------------------- | ------ | ----- | ------ | ------- | ------ | ---------- |
| Can deserialize arbitrary types (unattributed)                        | -      | no    | yes    | no      | no     | no         |
| Can deserialize arbitrary types (`[Serializable]`)                    | yes    | no    | yes    | -       | no     | no         |
| Can deserialize arbitrary types (`[DataContract]`)                    | -      | no    | yes    | -       | no     | no         |
| Serialized root type information                                      | assm   | ns    | assm   | name    | none   | none       |
| Can deserialize to different assembly (unattributed)                  | -      | yes   | no     | yes     | yes    | yes        |
| Can deserialize to different assembly (`[Serializable]`)              | no     | yes   | no     | -       | yes    | yes        |
| Can deserialize to different assembly (`[DataContract]`)              | -      | yes   | no     | -       | yes    | yes        |
| Can deserialize to different namespace (unattributed)                 | -      | no    | no     | yes     | yes    | yes        |
| Can deserialize to different namespace (`[Serializable]`)             | no     | no    | no     | -       | yes    | yes        |
| Can deserialize to different namespace (`[DataContract]` w/o attrib)  | -      | no    | no     | -       | yes    | yes        |
| Can deserialize to different namespace (`[DataContract]` w/ attrib)   | -      | yes   | no     | -       | yes    | yes        |
| Can deserialize to different class name (unattributed)                | -      | no    | no     | no      | yes    | yes        |
| Can deserialize to different class name (`[Serializable]`)            | no     | no    | no     | -       | yes    | yes        |
| Can deserialize to different class name (`[DataContract]` w/o attrib) | -      | no    | no     | -       | yes    | yes        |
| Can deserialize to different class name (`[DataContract]` w/ attrib)  | -      | yes   | no     | -       | yes    | yes        |

**Notes on features:**

* If **Can deserialize arbitrary types** is "yes", it means that the serializer doesn't require a "known types" list. If it's "no", all types need to be statically available (i.e. child class instead of base class) and/or a known types list must be provided.
* **Serialized root type information:** what information about the root type is serialized. Possible values: **assm** = assembly, namespace and type name, **ns** = namespace and type name, **name** = type name, **none** = nothing
  * This means, the more information is stored, the more restrictive the deserialization is. For example, for **assm** you can't change any type information about the deserialized object, while **ns** at least allows you to change the assembly of the type when deserializing (if name and namespace remain the same).
* **`[DataContract]` w/ attrib** means that the attribute `Name` or `Namespace` is specified respectively. **`[DataContract]` w/o attrib** means that this attribute is not specified (i.e. their values are inherited from the type the data contract is defined on).

## Reference Support

| Feature                                                               | BF     | DCS   | NDCS   | XMLSer  | DCJS   | Newtonsoft |
| --------------------------------------------------------------------- | ------ | ----- | ------ | ------- | ------ | ---------- |
| Supports references (unattributed)                                    | -      | no    | yes    | no      | no     | yes        |
| Supports references (`[Serializable]`)                                | yes    | no    | yes    | -       | no     | yes        |
| Supports references (`[DataContract(IsReference=false)`)              | -      | no    | yes    | -       | no     | yes        |
| Supports references (`[DataContract(IsReference=true)`)               | -      | yes   | yes    | -       | no     | yes        |
| Supports references loops (unattributed)                              | -      | -     | yes    | -       | -      | yes        |
| Supports references loops (`[Serializable]`)                          | yes    | -     | yes    | -       | -      | yes        |
| Supports references loops (`[DataContract]`)                          | -      | yes   | yes    | -       | -      | yes        |
| Can detected references loops (unattributed)                          | -      | yes   | yes    | yes     | yes    | yes        |
| Can detected references loops (`[Serializable]`)                      | yes    | yes   | yes    | -       | yes    | yes        |
| Can detected references loops (`[DataContract(IsReference=false)]`)   | -      | yes   | yes    | -       | yes    | yes        |
| Can detected references loops (`[DataContract(IsReference=true)]`)    | -      | yes   | yes    | -       | yes    | yes        |

**Notes on features:**

* **Supports references** means that, if the same object (i.e. same reference) exists multiple times in the object tree, it won't be deserialized as two different objects (two different references).

**Notes on serializers:**

* Newtonsoft.JSON serializer: If in the settings, `ReferenceLoopHandling` is set to `Serialize` but `PreserveReferencesHandling` remains `None` (which is the default), the serializer won't detect reference loops. Instead it'll cause a stack overflow.

## Other

| Feature                                                               | BF     | DCS   | NDCS   | XMLSer  | DCJS   | Newtonsoft |
| --------------------------------------------------------------------- | ------ | ----- | ------ | ------- | ------ | ---------- |
| Can serialize readonly collections                                    | yes    | yes   | yes    | no      | yes    | yes        |
| Serializes enums as                                                   | bin    | name  | name   | name    | int    | int        |
| Can deserialize unknown enum values                                   | yes    | no    | no     | no      | yes    | yes        |
| Requires `[EnumMember]` attributes                                    | no     | no    | no     | no      | no     | no         |
| Can serialize static members                                          | no     | no    | no     | no      | no     | yes/no     |

**Notes on features:**

* Values for **Serializes enums as** are: "name", "int", and "bin"(ary).
* For more information about `[EnumMember]`, see [Enumeration Types in Data Contracts](http://msdn.microsoft.com/en-us/library/aa347875.aspx).
* The test for serializing `static` members is included here only for completeness reasons and because some tests depend on static fields not being serialized (which is what one would expect).

**Notes on serializers:**

* The Newtonsoft.JSON serializer does serialize static fields/properties attributed with `[DataMember]`. This phenomenon is tracked as [issue #399](https://github.com/JamesNK/Newtonsoft.Json/issues/399).

## Conclusion

The `BinaryFormatter` is the most versatile serializer because it has the least serialization restriction - except for two: 1. Both sides (i.e. serializing and deserializing side) need to use the same assembly. 2. You can't serialize unattributed types. When used for internal communication between software components the first limitation may not be a problem. The second limitation, however, may be a deal-breaker.

The `DataContractSerializer` is more forgiving when deserializing types from a different assembly (version) and it can serialize unattributed types. The first advantage comes with a price though: You can't deserialize arbitrary types, i.e. you need to provide the serializer with a list of known types. It also doesn't allow you to deserialize unknown enum values (even though C# supports this). In our software project this is a constant source for problems because we get our enum values from an outside source (server).

The `NetDataContractSerializer` mixes pros and cons of both the `BinaryFormatter` and the `DataContractSerializer`. It can deserialize arbitrary types and thus requires the same assembly on both side (like with the `BinaryFormatter`), but also supports serializing unattributed types (like the `DataContractSerializer`). It also can't deserialize unknown enum values.

The `XmlSerializer` is the least powerful serializer in that it doesn't support serializing anything fancy (e.g. private fields, readonly fields, ...). I don't see any benefit in using this serializer when compared to the other serializers available.

The `DataContractJsonSerializer` is a JSON serializer that just serializes what's in the official JSON standard. Thus, it doesn't support serializing references but other than that has the same serialization capabilities as the `DataContractSerializer`. Since JSON doesn't contain any type information, this serializer (together with the Newtonsoft.JSON serializer) has the least restrictions on what type to deserialize to. On the other hand however, this means that you can't deserialize arbitrary types - and since no type names are stored in JSON, you can't even provide a known types list.

The **Newtonsoft.JSON serializer** is the other JSON serializer but is vastly superior to the `DataContractJsonSerializer` as it supports more features - like references and type names. Unfortunately it can't deserialize arbitrary types if they're in a list (i.e. `List<object>`), even if type names are enabled. Also it can't deserialize classes that don't have public constructors and also no non-public parameterless constructor.

## History

* 2014-10-27 : Published
* 2014-10-30 : Added results for classes with non-public constructors
