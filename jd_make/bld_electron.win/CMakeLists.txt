cmake_minimum_required(VERSION 3.19.1)

if(UNIX AND NOT APPLE)
set(LINUX TRUE)
endif()

add_compile_options(-v -mcmodel=medium -Wall -fno-function-sections -fno-data-sections -Wextra -Wno-unused-parameter -pthread 
#-fvisibility=hidden -fvisibility-inlines-hidden
)

if(AT_CONFIGURATION STREQUAL "pub")
	add_compile_options(-O2 -g1 ) 
else()
	add_compile_options(-O0 -ggdb ) 
endif()

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/${env.WSL_DISTRO_NAME}/build/bin)

if(LINUX)
    add_compile_options(-fPIC )
    add_link_options(-fuse-ld=lld -Wl,-z,notext)
else()
    set(CMAKE_TOOLCHAIN_FILE ${CMAKE_SOURCE_DIR}/cross.cmake)
    add_compile_options(-m32  --target=i686-pc-windows-cygnus -Wa,-mbig-obj $<$<COMPILE_LANGUAGE:CXX>:-frtti>)
    add_link_options(-m32 --target=i686-pc-windows-cygnus)
endif()

project(MyProject)


if(LINUX)
    set(VITA2_C "/mnt/c")
else()
    set(VITA2_C "c:/")
endif()

set(VITA2_GIT "${CMAKE_CURRENT_SOURCE_DIR}/../../../")

set(_target "cppcoro")

#####
set(helloworld_SRC 

${CMAKE_SOURCE_DIR}/../../lib/async_mutex.cpp
${CMAKE_SOURCE_DIR}/../../lib/lightweight_manual_reset_event.cpp
)

add_library(common INTERFACE)

add_library(${_target} STATIC ${helloworld_SRC})

target_compile_options(common INTERFACE $<$<COMPILE_LANGUAGE:C>:
-std=gnu11
-Wall
-fno-strict-aliasing
-fno-omit-frame-pointer
-fno-short-enums
-Wno-deprecated-declarations
-fno-addrsig

>
$<$<COMPILE_LANGUAGE:CXX>:
-std=gnu++20 
-fexceptions
-stdlib=libc++

>
)

target_include_directories(common INTERFACE 
/mnt/c/Users/jdu/Downloads/boost_1_69_0/
#/usr/lib/llvm-10/include/c++/v1
C:/ws/libcxx/libcxx-9.0.1-1.i686/inst/usr/include/c++/v1


#special include for cxxabi.h(GLIBCXX)
#include/c++/v1/cxxabi.h was modified, see cxxabi_inc
#i686-pc-cygwin/10/include/c++/bits/cxx... was singled out.

C:/cygwin32/lib/gcc/i686-pc-cygwin/10/include/c++/i686-pc-cygwin
${VITA2_C}/myincludes_cygwin/cxxabi_inc
../../include
)

#https://gitlab.kitware.com/cmake/cmake/-/issues/15415

target_include_directories(${_target} PRIVATE $<TARGET_PROPERTY:common,INTERFACE_INCLUDE_DIRECTORIES>)
target_compile_options(${_target} PRIVATE $<TARGET_PROPERTY:common,INTERFACE_COMPILE_OPTIONS>)
target_compile_definitions(${_target} PRIVATE $<TARGET_PROPERTY:common,INTERFACE_COMPILE_DEFINITIONS>)

#target_link_libraries(${_target} PRIVATE $<TARGET_PROPERTY:common,INTERFACE_LINK_LIBRARIES>)
#target_link_options(${_target} PRIVATE $<TARGET_PROPERTY:common,INTERFACE_LINK_OPTIONS>)
#target_sources(${_target} PRIVATE $<TARGET_PROPERTY:common,INTERFACE_SOURCES>)


target_compile_definitions(common INTERFACE 
-D_LIBCPP_DISABLE_VISIBILITY_ANNOTATIONS
-D_LIBCPP_ENABLE_CXX20_REMOVED_ALLOCATOR_MEMBERS
-DFD_SETSIZE=1024
)

target_link_options(common INTERFACE 
#-shared
-v 
-Wl,-stats
-Wl,--build-id=none
#-stdlib=libc++
-Wl,--allow-multiple-definition


-Wl,--exclude-all-symbols
#-Wl,../at_standalone.def
-Wl,-soname,libmy_lib.dll
#-Wl,--enable-stdcall-fixup
-Wl,-e -Wl,__cygwin_dll_entry2@12



#-Wl,--default-image-base-low
#-Wl,--wrap=__cxa_throw
#-Wl,--threads
#-Wl,--thread-count,4
-Wl,-no-demangle
#-Wl,--verbose
#--sysroot=c:/cygwin64/usr/i686-pc-cygwin/sys-root
#-fno-lto
#--buildmode=exe
#--sysroot=c:/cygwin32
#-nostdinc++ 
#-nostdlib 
#-nodefaultlibs 
#-nolibc -nostartfiles
# -Lc:/cygwin32/lib
# -Lc:/cygwin32/lib/w32api 
# -LC:/cygwin32/lib/gcc/i686-pc-cygwin/10
# c:/cygwin32/lib/crt0.o 
# c:/cygwin32/lib/gcc/i686-pc-cygwin/10/crtbegin.o 
# c:/cygwin32/lib/default-manifest.o 
# c:/cygwin32/lib/gcc/i686-pc-cygwin/10/crtend.o
)

if(LINUX)
target_link_directories (common INTERFACE 
#/mnt/c/Users/jdu/Downloads/boost_1_69_0/stage/lib
)

else()
target_link_directories (common INTERFACE 
#C:/ws/boost_cyg/boost-1.69.0-1.i686/build/stage/lib
)

endif()

SET(CMAKE_FIND_LIBRARY_PREFIXES "")
SET(CMAKE_FIND_LIBRARY_SUFFIXES "" ".a" "-1_69.a")

#find_library(SOMELIB libstdc++.dll.a)

find_library(AT_CXX_S NAMES libc++.dll.a libc++.so
REQUIRED)

find_library(AT_CXX_EXT_S NAMES libc++experimental.a)

#find_library(AT_CXXABI_D libc++abi.a REQUIRED)

find_library(AT_BOOST1_S NAMES libboost_system REQUIRED)
find_library(AT_BOOST2_S NAMES libboost_chrono REQUIRED)
find_library(AT_BOOST_FS_S NAMES libboost_filesystem REQUIRED)
find_library(AT_BOOST_TH_S NAMES libboost_thread REQUIRED)
find_library(AT_BOOST_RE_S NAMES libboost_regex REQUIRED)
find_library(AT_BOOST_DT_S NAMES libboost_date_time REQUIRED)


target_link_libraries (common INTERFACE 
${AT_CXX_S}
#${SOMELIB}
stdc++

atomic
pthread
#my_ssl
#my_ws
#gcc_s gcc 
#cygwin 
#advapi32 shell32 user32 kernel32
#c
#m
#C:/ws/bbbb/vita2_bg/vita2_bg/newssl.Native.win/Debug/newssl.Native.win.lib
)
