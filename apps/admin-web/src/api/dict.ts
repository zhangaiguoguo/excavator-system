import request from '@/utils/request'
import type { DictType, DictData } from '@excavator/types'

// Dict Type
export function listType(query?: any) {
  return request({
    url: '/system/dict/type/list',
    method: 'get',
    params: query
  })
}

export function getType(id: string) {
  return request({
    url: '/system/dict/type/' + id,
    method: 'get'
  })
}

export function addType(data: Partial<DictType>) {
  return request({
    url: '/system/dict/type',
    method: 'post',
    data: data
  })
}

export function updateType(data: Partial<DictType>) {
  return request({
    url: '/system/dict/type/' + data.id,
    method: 'patch',
    data: data
  })
}

export function delType(id: string) {
  return request({
    url: '/system/dict/type/' + id,
    method: 'delete'
  })
}

// Dict Data
export function listData(query?: any) {
  return request({
    url: '/system/dict/data/list',
    method: 'get',
    params: query
  })
}

export function getData(id: string) {
  return request({
    url: '/system/dict/data/' + id,
    method: 'get'
  })
}

export function getDicts(dictType: string) {
  return request({
    url: '/system/dict/data/type/' + dictType,
    method: 'get'
  })
}

export function addData(data: Partial<DictData>) {
  return request({
    url: '/system/dict/data',
    method: 'post',
    data: data
  })
}

export function updateData(data: Partial<DictData>) {
  return request({
    url: '/system/dict/data/' + data.id,
    method: 'patch',
    data: data
  })
}

export function delData(id: string) {
  return request({
    url: '/system/dict/data/' + id,
    method: 'delete'
  })
}
