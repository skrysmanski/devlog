#include <iostream>
#include <string>
using namespace std;

//////////////////////////////////////////////////////////////////////////

class BaseClass {
public:
  void write() const {
    printf("In base class\n");
  }
};
typedef BaseClass* BaseClassPointer;

class ChildClass : public BaseClass {
public:
  virtual void write() const {
    printf("In child class\n");
  }
};
typedef ChildClass* ChildClassPointer;

//////////////////////////////////////////////////////////////////////////

// STRANGE 1: Changing the pointer type here to "BaseClass*" "fixes" the problem, i.e.
//BaseClass* g_somePointer = new ChildClass();
ChildClass* g_somePointer = new ChildClass();

const BaseClassPointer& getReference() {
  // warning C4172
  //return *g_somePointer;
  const BaseClassPointer& val = g_somePointer;
  return val;
}

const BaseClassPointer& getRef() {
  // Calls the destructor on exit and thereby overwrites the call stack.
  string someString = "ignore me";

  const BaseClassPointer& val = getReference();
  return val;
}

int _tmain(int argc, _TCHAR* argv[]) {
  BaseClassPointer child = getRef();

  child->write();

  return 0;
}
