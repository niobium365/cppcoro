cmake_minimum_required(VERSION 3.16.1)

if(UNIX AND NOT APPLE)
  set(LINUX TRUE)
endif()

add_compile_options(
  -v
  -Wall
  -fno-function-sections
  -fno-data-sections
  -Wextra
  -Wno-unused-parameter
  -frtti
  -fPIC
  -fpic
  -pthread)
set(CMAKE_C_COMPILER_WORKS 1)
set(CMAKE_CXX_COMPILER_WORKS 1)

if(AT_CONFIGURATION STREQUAL "pub")
  add_compile_options(-O2 -g1)
else()
  add_compile_options(-O0 -ggdb)
endif()

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY
    ${CMAKE_SOURCE_DIR}/${env.WSL_DISTRO_NAME}/build/bin)

set(VS_NdkRoot
    $ENV{CMAKE_TOOLCHAIN_DIR})

set(CMAKE_C_COMPILER clang-10)
set(CMAKE_CXX_COMPILER clang++-10)
# set(CMAKE_TOOLCHAIN_FILE ${VS_NdkRoot}/cross.cmake)

if(AT_BIT EQUAL 64)
else()
  add_compile_options(-m32 --target=armv7a-linux-androideabi -mcmodel=medium)
  add_link_options(-m32 --target=armv7a-linux-androideabi)
endif()

if("${AT_CONFIGURATION}${AT_BIT}" STREQUAL "test64")
  add_compile_options(-fsanitize=address -fno-sanitize-address-use-after-scope)
  link_directories(clang_rt.asan-aarch64-android)
endif()

project(MyProject)

if(LINUX)
  set(VITA2_C "/mnt/c")
else()
  set(VITA2_C "c:/")
endif()

set(VITA2_GIT "${CMAKE_CURRENT_SOURCE_DIR}/../../../")

set(_target "cppcoro")

#
set(helloworld_SRC
    ${CMAKE_SOURCE_DIR}/../../lib/async_mutex.cpp
    ${CMAKE_SOURCE_DIR}/../../lib/lightweight_manual_reset_event.cpp)

add_library(common INTERFACE)

add_library(${_target} STATIC ${helloworld_SRC})

target_compile_options(common INTERFACE -std=gnu++20 -fexceptions
                                        -stdlib=libc++)

target_include_directories(
  common
  INTERFACE ../../include)

# https://gitlab.kitware.com/cmake/cmake/-/issues/15415

target_include_directories(
  ${_target} PRIVATE $<TARGET_PROPERTY:common,INTERFACE_INCLUDE_DIRECTORIES>)
target_compile_options(
  ${_target} PRIVATE $<TARGET_PROPERTY:common,INTERFACE_COMPILE_OPTIONS>)
target_compile_definitions(
  ${_target} PRIVATE $<TARGET_PROPERTY:common,INTERFACE_COMPILE_DEFINITIONS>)

target_compile_definitions(
  common
  INTERFACE -D_LIBCPP_DISABLE_VISIBILITY_ANNOTATIONS
            -D_LIBCPP_ENABLE_CXX20_REMOVED_ALLOCATOR_MEMBERS -DFD_SETSIZE=1024)
